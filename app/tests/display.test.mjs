import test from "node:test";
import assert from "node:assert/strict";
import {
  createDemo,
  parseSnapshot,
  acceptSnapshot,
  activeSteps,
  isDone,
  timelineBounds,
  dataQuality,
  remainingMinutes,
  answerQuestion,
  detectIntent,
} from "../src/display/model.ts";
const now = 1800000000000;
test("1/5/10 samples fit a common complete timeline, with unique cyclic steps", () => {
  for (const n of [1, 5, 10]) {
    const s = createDemo(n, 83, "running", now);
    assert.equal(parseSnapshot(s).samples.length, n);
    const bounds = timelineBounds(s);
    for (const sample of s.samples) {
      assert.equal(sample.steps.filter((t) => t.stage === "wash").length, 3);
      assert.equal(new Set(sample.steps.map((t) => t.id)).size, 7);
      assert.ok(
        sample.steps.every(
          (t) => t.start >= bounds.start && t.end <= bounds.end,
        ),
      );
    }
  }
});
test("sampling detection overlaps reaction and both are active", () => {
  const s = createDemo(1, 42, "running", now);
  assert.deepEqual(
    activeSteps(s.samples[0]).map((t) => t.stage),
    ["react", "detect"],
  );
  assert.equal(s.result, undefined);
});
test("completion derives from all step instances; paused ETA is unknown", () => {
  const s = createDemo(10, 180, "running", now);
  assert.equal(s.status, "finished");
  assert.ok(s.samples.every(isDone));
  assert.equal(remainingMinutes(createDemo(5, 83, "paused", now), now), null);
  assert.equal(
    remainingMinutes({ ...s, status: "running", estimatedEndAt: now - 1 }, now),
    null,
  );
});
test("new run replaces the snapshot and cannot inherit previous result", () => {
  const old = createDemo(5, 83, "running", now);
  const next = { ...createDemo(1, 0, "running", now + 1000), runId: "run-2" };
  const accepted = acceptSnapshot(old, next);
  assert.ok(accepted);
  assert.equal(accepted.result, undefined);
  assert.equal(accepted.samples.length, 1);
  assert.equal(acceptSnapshot(accepted, old), null);
});
test("duplicate and out of order updates are rejected", () => {
  const s = createDemo(5, 83, "running", now);
  assert.equal(acceptSnapshot(s, s), null);
  assert.equal(acceptSnapshot(s, { ...s, sequence: s.sequence - 1 }), null);
  assert.equal(
    acceptSnapshot(s, { ...s, sequence: s.sequence + 1, serverTime: now - 1 }),
    null,
  );
  assert.ok(acceptSnapshot(s, { ...s, sequence: s.sequence + 1 }));
});
test("malformed or cross-sample results cannot become visible", () => {
  const s = createDemo(5, 83, "running", now);
  for (const patch of [
    { schemaVersion: 2 },
    { status: "invented" },
    { sequence: -1 },
    { samples: [s.samples[0], s.samples[0]] },
    { result: { ...s.result, sampleId: "other" } },
    { result: { ...s.result, mean: NaN } },
    { result: { ...s.result, measuredAt: s.startedAt - 1 } },
    { samples: [{ id: "broken", steps: [null] }] },
    {
      samples: [
        { id: "broken", steps: [{ ...s.samples[0].steps[0], end: 0 }] },
      ],
    },
  ])
    assert.equal(parseSnapshot({ ...s, ...patch }), null);
});
test("demo, empty, stale event, stale receipt and disconnection are distinct", () => {
  const s = createDemo(5, 83, "running", now);
  assert.equal(dataQuality(true, false, s, now, now), "demo");
  assert.equal(dataQuality(false, true, null, 0, now), "waiting");
  assert.equal(dataQuality(false, false, s, now, now), "offline");
  assert.equal(dataQuality(false, true, s, now - 31000, now), "stale");
  assert.equal(
    dataQuality(false, true, { ...s, serverTime: now - 61000 }, now, now),
    "stale",
  );
  assert.equal(dataQuality(false, true, s, now, now), "live");
});
test("answers never claim stale facts or invent quality thresholds", () => {
  const s = createDemo(5, 83, "running", now);
  for (const intent of ["experiment", "step", "count", "time", "quality"]) {
    assert.match(answerQuestion(intent, s, "offline", now), /没有可用/);
    assert.match(answerQuestion(intent, s, "demo", now), /^演示数据/);
  }
  assert.match(answerQuestion("quality", s, "live", now), /暂不判断/);
  assert.match(
    answerQuestion(
      "quality",
      { ...s, result: { ...s.result, verdict: "合格" } },
      "live",
      now,
    ),
    /暂不判断/,
  );
});
test("voice intent stays within five read-only questions", () => {
  assert.equal(detectIntent("帮我启动机械臂"), null);
  assert.equal(detectIntent("还有多长时间结束"), "time");
  assert.equal(detectIntent("微球粒径和质量怎么样"), "quality");
  assert.equal(detectIntent("有多少样本"), "count");
  assert.equal(detectIntent("现在做到哪一步"), "step");
});
