import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { buildIatUrl, createIatTranscript } from "../src/display/xfIat.ts";

test("听写结果按分片追加与动态修正重组", () => {
  const transcript = createIatTranscript();
  assert.equal(
    transcript.push({
      data: {
        status: 0,
        result: { ws: [{ cw: [{ w: "今天" }] }, { cw: [{ w: "天气" }] }] },
      },
    }),
    "今天天气",
  );
  assert.equal(
    transcript.push({
      data: {
        status: 1,
        result: { ws: [{ cw: [{ w: "很好" }] }], pgs: "apd" },
      },
    }),
    "今天天气很好",
  );
  assert.equal(
    transcript.push({
      data: {
        status: 1,
        result: { ws: [{ cw: [{ w: "真好" }] }], pgs: "rpl", rg: [1, 2] },
      },
    }),
    "今天天气真好",
  );
  assert.equal(
    transcript.push({
      data: {
        status: 2,
        result: { ws: [{ cw: [{ w: "。" }] }] },
      },
    }),
    "今天天气真好。",
  );
  transcript.reset();
  assert.equal(
    transcript.push({
      data: { status: 0, result: { ws: [{ cw: [{ w: "重新" }] }] } },
    }),
    "重新",
  );
});

test("动态修正区间覆盖多分片时整段替换", () => {
  const transcript = createIatTranscript();
  transcript.push({
    data: { status: 0, result: { ws: [{ cw: [{ w: "样本" }] }] } },
  });
  transcript.push({
    data: { status: 1, result: { ws: [{ cw: [{ w: "数量" }] }], pgs: "apd" } },
  });
  transcript.push({
    data: { status: 1, result: { ws: [{ cw: [{ w: "一共多少个" }] }], pgs: "rpl", rg: [0, 2] } },
  });
  assert.equal(transcript.push({ data: { status: 2 } }), "一共多少个");
});

test("听写鉴权地址与 Node 端独立实现的 HMAC 签名一致", () => {
  const creds = { apiKey: "test-api-key", apiSecret: "test-api-secret" };
  const date = "Fri, 16 Oct 2026 12:00:00 GMT";
  const url = buildIatUrl(creds, { date });

  const origin = "host: iat-api.xfyun.cn\ndate: " + date + "\nGET /v2/iat HTTP/1.1";
  const signature = createHmac("sha256", creds.apiSecret).update(origin).digest("base64");
  const authorization = Buffer.from(
    `api_key="${creds.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`,
  ).toString("base64");
  assert.equal(
    url,
    "wss://iat-api.xfyun.cn/v2/iat" +
      `?authorization=${encodeURIComponent(authorization)}` +
      `&date=${encodeURIComponent(date)}&host=iat-api.xfyun.cn`,
  );
});
