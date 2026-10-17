import {
  onMounted,
  onUnmounted,
  ref,
  watch,
  type Ref,
  type ComputedRef,
} from "vue";
import {
  answerQuestion,
  detectIntent,
  type Intent,
  type Quality,
  type Snapshot,
} from "./model";
import { loadXfIatCredentials, XfIatSession } from "./xfIat";
export function useVoice(
  snapshot: Ref<Snapshot | null>,
  quality: ComputedRef<Quality>,
  now: Ref<number>,
) {
  const phase = ref<"idle" | "listening" | "thinking" | "speaking" | "error">(
    "idle",
  );
  const caption = ref("");
  const captionId = ref(0);
  const highlight = ref<Intent | null>(null);
  const muted = ref(false);
  const browserSupported = !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
  const cloudConfigured = !!loadXfIatCredentials();
  const supported = cloudConfigured || browserSupported;
  let recognition: any;
  let iat: XfIatSession | null = null;
  let clearTimer: ReturnType<typeof setTimeout>;
  let listenTimer: ReturnType<typeof setTimeout>;
  let safetyTimer: ReturnType<typeof setTimeout>;
  let session = 0;
  let captionUntil = 0;
  let pausedAt: number | null = null;
  let clearRequested = false;
  function scheduleClear() {
    clearTimeout(clearTimer);
    if (!clearRequested || pausedAt !== null) return;
    const token = session;
    clearTimer = setTimeout(() => {
      if (token !== session) return;
      caption.value = "";
      highlight.value = null;
      phase.value = "idle";
      clearRequested = false;
    }, Math.max(0, captionUntil - Date.now()));
  }
  function setCaptionReading({ text, duration }: { text: string; duration: number }) {
    if (text !== caption.value) return;
    captionUntil = Math.max(captionUntil, Date.now() + duration);
    scheduleClear();
  }
  function pauseCaption({ text, paused }: { text: string; paused: boolean }) {
    if (text !== caption.value) return;
    if (paused && pausedAt === null) pausedAt = Date.now();
    else if (!paused && pausedAt !== null) {
      captionUntil += Date.now() - pausedAt;
      pausedAt = null;
    }
    scheduleClear();
  }
  function stop() {
    session++;
    captionId.value = session;
    clearTimeout(clearTimer);
    clearTimeout(listenTimer);
    clearTimeout(safetyTimer);
    captionUntil = 0;
    pausedAt = null;
    clearRequested = false;
    iat?.abort();
    iat = null;
    recognition?.abort();
    recognition = null;
    window.speechSynthesis?.cancel();
    phase.value = "idle";
    caption.value = "";
    highlight.value = null;
  }
  function show(text: string, intent: Intent | null = null) {
    stop();
    const token = session;
    caption.value = text;
    highlight.value = intent;
    phase.value = "speaking";
    const clear = () => {
      if (token !== session) return;
      clearTimeout(safetyTimer);
      captionUntil = Math.max(captionUntil, Date.now() + 2500);
      clearRequested = true;
      scheduleClear();
    };
    const canSpeak = !muted.value && !!window.speechSynthesis;
    // A stalled speech engine still ends the answer after the caption is readable.
    safetyTimer = setTimeout(
      clear,
      canSpeak ? Math.max(15000, text.length * 260) : Math.max(6000, text.length * 110),
    );
    if (canSpeak) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 1;
      utterance.onend = clear;
      utterance.onerror = clear;
      window.speechSynthesis.speak(utterance);
    }
  }
  function ask(intent: Intent) {
    show(
      answerQuestion(
        intent,
        snapshot.value,
        quality.value,
        quality.value === "demo"
          ? snapshot.value?.serverTime || now.value
          : now.value,
      ),
      intent,
    );
  }
  function handleTranscript(text: string) {
    const intent = detectIntent(text);
    if (intent) ask(intent);
    else
      show(
        "我可以介绍实验、当前步骤、样本数量、剩余时间和检测结果，请换一种说法。",
      );
  }
  function begin() {
    if (phase.value === "listening") return;
    stop();
    const token = session;
    const creds = loadXfIatCredentials();
    if (creds) {
      phase.value = "listening";
      caption.value = "正在聆听，请说话…";
      iat = new XfIatSession(creds, {
        onInterim: (text) => {
          if (token === session) caption.value = text;
        },
        onFinal: (text) => {
          if (token !== session) return;
          if (text) handleTranscript(text);
          else show("没有收到可识别的语音，请重试。");
        },
        onError: (message) => {
          if (token !== session) return;
          show(`${message}，可使用问题按钮查询。`);
        },
      });
      iat.start().catch(() => {
        if (token === session)
          show("无法访问麦克风，请在浏览器授权后重试，或使用问题按钮查询。");
      });
      listenTimer = setTimeout(end, 15000);
      return;
    }
    if (!browserSupported) {
      show("此浏览器暂不支持语音识别，请使用问题按钮查询。");
      return;
    }
    const Constructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    recognition = new Constructor();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;
    phase.value = "listening";
    caption.value = "正在聆听，请按住说话…";
    recognition.onresult = (event: any) => {
      if (token !== session) return;
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      const shown = final || interim;
      if (shown) caption.value = shown;
      if (final) handleTranscript(final);
    };
    recognition.onerror = (event: any) => {
      if (token !== session || event.error === "aborted") return;
      show(
        event.error === "not-allowed"
          ? "麦克风未获授权，可先使用问题按钮查询。"
          : "没有听清，请重新按住说话，或使用问题按钮。",
      );
    };
    recognition.onend = () => {
      if (
        token === session &&
        (phase.value === "listening" || phase.value === "thinking")
      )
        show("没有收到可识别的语音，请重试。");
    };
    try {
      recognition.start();
      listenTimer = setTimeout(end, 12000);
    } catch {
      show("无法启动语音识别，可使用问题按钮查询。");
    }
  }
  function end() {
    if (phase.value !== "listening") return;
    clearTimeout(listenTimer);
    phase.value = "thinking";
    if (iat) {
      if (!caption.value) caption.value = "正在识别…";
      iat.stop();
      return;
    }
    caption.value = "正在识别…";
    recognition?.stop();
  }
  function onBlur() {
    if (phase.value === "listening") end();
  }
  function onDown(event: KeyboardEvent) {
    if (
      event.code === "Space" &&
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLSelectElement) &&
      !(event.target instanceof HTMLButtonElement) &&
      !event.repeat
    ) {
      event.preventDefault();
      begin();
    }
  }
  function onUp(event: KeyboardEvent) {
    if (event.code === "Space" && phase.value === "listening") {
      event.preventDefault();
      end();
    }
  }
  watch(
    () => snapshot.value?.runId,
    () => stop(),
  );
  watch(quality, (value) => {
    if (!["live", "demo"].includes(value)) stop();
  });
  watch(muted, (value) => {
    if (value) window.speechSynthesis?.cancel();
  });
  onMounted(() => {
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
  });
  onUnmounted(() => {
    stop();
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", onBlur);
  });
  return {
    phase, caption, captionId, highlight, muted, supported,
    ask, begin, end, stop, setCaptionReading, pauseCaption,
  };
}
