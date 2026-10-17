import CryptoJS from "crypto-js";

export interface XfIatCredentials {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

const IAT_HOST = "iat-api.xfyun.cn";
const IAT_PATH = "/v2/iat";
const RATE = 16000;

/**
 * 讯飞语音听写（流式版）结果拼装。开启动态修正后，服务端通过
 * pgs=apd 追加分片、pgs=rpl 配合 rg 区间替换已发布的分片，
 * 前端按分片重组即可得到实时修正后的完整文本。
 */
export interface IatTranscript {
  push(payload: unknown): string;
  reset(): void;
}

export function createIatTranscript(): IatTranscript {
  const segments: string[] = [];
  return {
    push(payload: unknown) {
      const result = (payload as any)?.data?.result;
      if (result) {
        const text = (result.ws || [])
          .map((ws: any) => (ws.cw || []).map((cw: any) => cw.w || "").join(""))
          .join("");
        if (result.pgs === "rpl" && Array.isArray(result.rg)) {
          const [start, end] = result.rg;
          segments.splice(start, Math.max(0, end - start), text);
        } else if (text) {
          segments.push(text);
        }
      }
      return segments.join("");
    },
    reset() {
      segments.length = 0;
    },
  };
}

/** 生成带鉴权参数的听写 WebSocket 地址，date 需为 RFC1123 格式。 */
export function buildIatUrl(
  creds: Pick<XfIatCredentials, "apiKey" | "apiSecret">,
  { date = new Date().toUTCString() }: { date?: string } = {},
): string {
  const origin = `host: ${IAT_HOST}\ndate: ${date}\nGET ${IAT_PATH} HTTP/1.1`;
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(origin, creds.apiSecret),
  );
  const authorizationOrigin =
    `api_key="${creds.apiKey}", algorithm="hmac-sha256", ` +
    `headers="host date request-line", signature="${signature}"`;
  const authorization = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(authorizationOrigin),
  );
  return (
    `wss://${IAT_HOST}${IAT_PATH}` +
    `?authorization=${encodeURIComponent(authorization)}` +
    `&date=${encodeURIComponent(date)}&host=${encodeURIComponent(IAT_HOST)}`
  );
}

/** 凭据来自构建期环境变量，localStorage 里的同名键可覆盖，便于现场免重建配置。 */
export function loadXfIatCredentials(): XfIatCredentials | null {
  const env = (import.meta as any).env || {};
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem("voice.xfyun") || "{}");
    } catch {
      return {};
    }
  })();
  const pick = (key: string) => stored[key] || env[key] || "";
  const creds = {
    appId: pick("VITE_XFYUN_APP_ID"),
    apiKey: pick("VITE_XFYUN_API_KEY"),
    apiSecret: pick("VITE_XFYUN_API_SECRET"),
  };
  return creds.appId && creds.apiKey && creds.apiSecret ? creds : null;
}

interface IatCallbacks {
  onInterim?(text: string): void;
  onFinal?(text: string): void;
  onError?(message: string): void;
}

function floatToInt16Base64(input: Float32Array, fromRate: number): string {
  const ratio = fromRate / RATE;
  const count = ratio > 1 ? Math.floor(input.length / ratio) : input.length;
  const pcm = new Int16Array(count);
  for (let i = 0; i < count; i++) {
    const sample = ratio > 1 ? input[Math.floor(i * ratio)] : input[i];
    pcm[i] = (Math.max(-1, Math.min(1, sample)) * 0x7fff) | 0;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/**
 * 一次按住说话对应的听写会话：麦克风 16k 单声道采样经
 * WebSocket 分帧上行，中间结果实时回调，松开后上行结束帧并等待最终结果。
 */
export class XfIatSession {
  private ws?: WebSocket;
  private stream?: MediaStream;
  private context?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private processor?: ScriptProcessorNode;
  private transcript = createIatTranscript();
  private authSent = false;
  private finished = false;
  private finalizeTimer: ReturnType<typeof setTimeout>;
  private creds: XfIatCredentials;
  private callbacks: IatCallbacks;

  constructor(creds: XfIatCredentials, callbacks: IatCallbacks = {}) {
    this.creds = creds;
    this.callbacks = callbacks;
  }

  async start() {
    const ws = new WebSocket(buildIatUrl(this.creds));
    this.ws = ws;
    ws.onmessage = (event) => this.receive(event.data);
    ws.onerror = () => this.fail("云端识别连接失败");
    ws.onclose = () => this.fail("云端识别连接已断开");
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true },
    });
    if (this.finished) {
      this.releaseMedia();
      return;
    }
    const context = new AudioContext({ sampleRate: RATE });
    const source = context.createMediaStreamSource(this.stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) =>
      this.sendAudio(event.inputBuffer.getChannelData(0));
    source.connect(processor);
    processor.connect(context.destination);
    this.context = context;
    this.source = source;
    this.processor = processor;
  }

  /** 停止采集并上行结束帧；服务端回传最终结果后触发 onFinal。 */
  stop() {
    this.closeAudio();
    const ws = this.ws;
    if (!ws || this.finished) return;
    if (ws.readyState === WebSocket.CONNECTING) {
      this.fail("云端识别连接中断");
      return;
    }
    if (ws.readyState !== WebSocket.OPEN) return;
    this.sendFrame({ data: { status: 2, audio: "" } });
    this.finalizeTimer = setTimeout(() => this.fail("云端识别等待超时"), 6000);
  }

  abort() {
    this.finished = true;
    clearTimeout(this.finalizeTimer);
    this.closeAudio();
    this.releaseMedia();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = undefined;
    }
  }

  private sendAudio(input: Float32Array) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN || this.finished) return;
    const audio = floatToInt16Base64(input, this.context?.sampleRate || RATE);
    if (!this.authSent) {
      this.authSent = true;
      this.sendFrame({
        common: { app_id: this.creds.appId },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          dwa: "wpgs",
          ptt: 1,
        },
        data: { status: 0, format: "audio/L16;rate=16000", encoding: "raw", audio },
      });
      return;
    }
    this.sendFrame({
      data: { status: 1, format: "audio/L16;rate=16000", encoding: "raw", audio },
    });
  }

  private sendFrame(payload: Record<string, unknown>) {
    this.ws?.send(JSON.stringify(payload));
  }

  private receive(raw: unknown) {
    let message: any;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (message.code) {
      this.fail(`云端识别服务错误 ${message.code}：${message.message || "未知错误"}`);
      return;
    }
    const text = this.transcript.push(message);
    if (message.data?.status === 2) {
      this.finished = true;
      clearTimeout(this.finalizeTimer);
      this.closeAudio();
      this.releaseMedia();
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
        this.ws = undefined;
      }
      this.callbacks.onFinal?.(text.trim());
    } else if (text) {
      this.callbacks.onInterim?.(text);
    }
  }

  private fail(message: string) {
    if (this.finished) return;
    this.finished = true;
    clearTimeout(this.finalizeTimer);
    this.closeAudio();
    this.releaseMedia();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = undefined;
    }
    this.callbacks.onError?.(message);
  }

  private closeAudio() {
    if (this.processor) {
      this.processor.onaudioprocess = null;
      this.processor.disconnect();
      this.processor = undefined;
    }
    this.source?.disconnect();
    this.source = undefined;
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = undefined;
  }

  private releaseMedia() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
  }
}
