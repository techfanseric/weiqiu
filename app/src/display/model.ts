/** Display v1 is a full snapshot contract, never an implicit merge of unrelated runs. */
export type Stage = "prepare" | "react" | "detect" | "wash" | "dry";
export type RunStatus = "running" | "paused" | "finished" | "error" | "idle";
export type StepStatus = "planned" | "running" | "done" | "error";
export interface Step {
  id: string;
  stage: Stage;
  label: string;
  start: number;
  end: number;
  status: StepStatus;
}
export interface Sample {
  id: string;
  steps: Step[];
}
export interface Result {
  sampleId: string;
  measuredAt: number;
  mean: number;
  cv: number;
  count: number;
  distribution: { label: string; count: number }[];
  verdict?: string;
  rule?: string;
}
export interface Snapshot {
  schemaVersion: 1;
  source: "live" | "demo";
  runId: string;
  sequence: number;
  serverTime: number;
  startedAt: number;
  name: string;
  status: RunStatus;
  estimatedEndAt?: number;
  samples: Sample[];
  result?: Result;
}
export type Quality = "demo" | "live" | "stale" | "offline" | "waiting";
export const stages: {
  id: Stage;
  label: string;
  short: string;
  description: string;
  color: string;
}[] = [
  {
    id: "prepare",
    label: "配液与混合",
    short: "配液",
    description: "按配方添加试剂，为微球制备做好准备",
    color: "#718EA8",
  },
  {
    id: "react",
    label: "聚合反应",
    short: "反应",
    description: "在反应容器内形成微球，过程中定时取样",
    color: "#014EC0",
  },
  {
    id: "detect",
    label: "取样检测",
    short: "检测",
    description: "采集显微图像，统计微球粒径与分布",
    color: "#16828B",
  },
  {
    id: "wash",
    label: "离心清洗",
    short: "清洗",
    description: "分离上清液并超声混匀，按工艺重复清洗",
    color: "#6177AE",
  },
  {
    id: "dry",
    label: "最终烘干",
    short: "烘干",
    description: "去除残余溶剂，完成本轮微球制备",
    color: "#B18B47",
  },
];
export const statusLabels: Record<RunStatus, string> = {
  running: "实验进行中",
  paused: "实验已暂停",
  finished: "实验已完成",
  error: "实验异常",
  idle: "等待实验",
};
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const text = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= 200;
export function parseSnapshot(value: unknown): Snapshot | null {
  const v = value as Snapshot;
  if (
    !v ||
    v.schemaVersion !== 1 ||
    !["live", "demo"].includes(v.source) ||
    !text(v.runId) ||
    !text(v.name) ||
    !Number.isInteger(v.sequence) ||
    v.sequence < 0 ||
    !finite(v.serverTime) ||
    !finite(v.startedAt) ||
    !Object.prototype.hasOwnProperty.call(statusLabels, v.status)
  )
    return null;
  if (
    !Array.isArray(v.samples) ||
    v.samples.length > 10 ||
    (v.estimatedEndAt != null && !finite(v.estimatedEndAt))
  )
    return null;
  const ids = new Set<string>();
  for (const s of v.samples) {
    if (
      !s ||
      !text(s.id) ||
      ids.has(s.id) ||
      !Array.isArray(s.steps) ||
      s.steps.length > 120
    )
      return null;
    ids.add(s.id);
    const stepIds = new Set<string>();
    for (const step of s.steps) {
      if (
        !step ||
        !text(step.id) ||
        stepIds.has(step.id) ||
        !text(step.label) ||
        !stages.some((t) => t.id === step.stage) ||
        !["planned", "running", "done", "error"].includes(step.status) ||
        !finite(step.start) ||
        !finite(step.end) ||
        step.end <= step.start ||
        step.start < v.startedAt
      )
        return null;
      stepIds.add(step.id);
    }
  }
  const r = v.result;
  if (
    r &&
    (!ids.has(r.sampleId) ||
      !finite(r.measuredAt) ||
      r.measuredAt < v.startedAt ||
      r.measuredAt > v.serverTime ||
      !finite(r.mean) ||
      r.mean < 0 ||
      !finite(r.cv) ||
      r.cv < 0 ||
      !Number.isInteger(r.count) ||
      r.count < 0 ||
      !Array.isArray(r.distribution) ||
      r.distribution.length > 40 ||
      !r.distribution.every(
        (b) => b && text(b.label) && Number.isInteger(b.count) && b.count >= 0,
      ) ||
      (r.verdict != null && !text(r.verdict)) ||
      (r.rule != null && !text(r.rule)))
  )
    return null;
  return JSON.parse(JSON.stringify(v));
}
export function acceptSnapshot(
  current: Snapshot | null,
  incoming: unknown,
): Snapshot | null {
  const next = parseSnapshot(incoming);
  if (!next) return null;
  if (
    current &&
    (next.serverTime < current.serverTime ||
      (next.runId === current.runId && next.sequence <= current.sequence) ||
      (next.runId !== current.runId && next.startedAt <= current.startedAt))
  )
    return null;
  return next;
}
export function dataQuality(
  demo: boolean,
  connected: boolean,
  snapshot: Snapshot | null,
  receivedAt: number,
  now: number,
): Quality {
  if (demo) return "demo";
  if (!connected) return "offline";
  if (!snapshot) return "waiting";
  return !receivedAt ||
    now - receivedAt > 30000 ||
    Math.abs(now - snapshot.serverTime) > 60000
    ? "stale"
    : "live";
}
export const activeSteps = (sample: Sample) =>
  sample.steps.filter((s) => s.status === "running" || s.status === "error");
export const isDone = (sample: Sample) =>
  sample.steps.length > 0 && sample.steps.every((s) => s.status === "done");
export const actionLabel = (sample: Sample) =>
  isDone(sample)
    ? "已完成"
    : activeSteps(sample)
        .map((s) => s.label)
        .join(" · ") || "等待调度";
export function timelineBounds(snapshot: Snapshot) {
  return {
    start: snapshot.startedAt,
    end: Math.max(
      snapshot.startedAt + 60000,
      ...snapshot.samples.flatMap((s) => s.steps.map((t) => t.end)),
    ),
  };
}
export function remainingMinutes(snapshot: Snapshot | null, now: number) {
  if (
    !snapshot?.estimatedEndAt ||
    snapshot.status !== "running" ||
    snapshot.estimatedEndAt < now
  )
    return null;
  return Math.ceil((snapshot.estimatedEndAt - now) / 60000);
}
export function createDemo(
  count = 5,
  elapsed = 83,
  status: RunStatus = "running",
  anchor = Date.now(),
): Snapshot {
  count = Math.max(1, Math.min(10, Math.round(count)));
  const startedAt = anchor - elapsed * 60000;
  const specs: [Stage, string, number, number][] = [
    ["prepare", "配液与混合", 0, 12],
    ["react", "聚合反应", 12, 56],
    ["detect", "取样检测", 39, 46],
    ["wash", "第 1 次离心清洗", 56, 65],
    ["wash", "第 2 次离心清洗", 65, 74],
    ["wash", "第 3 次离心清洗", 74, 83],
    ["dry", "最终烘干", 83, 103],
  ];
  const samples = Array.from({ length: count }, (_, i) => ({
    id: `S-${String(i + 1).padStart(2, "0")}`,
    steps: specs.map(([stage, label, a, b], j) => ({
      id: `${i}-${j}`,
      stage,
      label,
      start: startedAt + (a + i * 8) * 60000,
      end: startedAt + (b + i * 8) * 60000,
      status: (elapsed >= b + i * 8
        ? "done"
        : elapsed >= a + i * 8
          ? "running"
          : "planned") as StepStatus,
    })),
  }));
  const detected = samples.filter(
    (s) => s.steps.find((t) => t.stage === "detect")?.status === "done",
  );
  const detectedSample = detected[detected.length - 1];
  return {
    schemaVersion: 1,
    source: "demo",
    runId: "DEMO-PS-DVB-001",
    sequence: Math.round(elapsed * 1000),
    serverTime: anchor,
    startedAt,
    name: "PS-DVB 微球智能制备",
    status: samples.every(isDone) ? "finished" : status,
    estimatedEndAt: startedAt + (103 + (count - 1) * 8) * 60000,
    samples,
    ...(detectedSample
      ? {
          result: {
            sampleId: detectedSample.id,
            measuredAt: detectedSample.steps[2].end,
            mean: 45.2,
            cv: 3.8,
            count: 1284,
            distribution: [
              { label: "38–40", count: 12 },
              { label: "40–42", count: 34 },
              { label: "42–44", count: 186 },
              { label: "44–46", count: 648 },
              { label: "46–48", count: 340 },
              { label: "48–50", count: 64 },
            ],
          },
        }
      : {}),
  };
}
export type Intent = "experiment" | "step" | "count" | "time" | "quality";
export const questions: { intent: Intent; label: string }[] = [
  { intent: "experiment", label: "正在做什么实验？" },
  { intent: "step", label: "现在做到哪一步？" },
  { intent: "count", label: "这批有多少样本？" },
  { intent: "time", label: "还需要多长时间？" },
  { intent: "quality", label: "微球质量怎么样？" },
];
export function detectIntent(text: string): Intent | null {
  if (/质量|粒径|合格|结果|品质/.test(text)) return "quality";
  if (/多久|多长|剩余|时间|结束/.test(text)) return "time";
  if (/多少|数量|几个|样本数/.test(text)) return "count";
  if (/步骤|哪一步|做到|进度|环节/.test(text)) return "step";
  if (/实验|制备|做什么/.test(text)) return "experiment";
  return null;
}
export function answerQuestion(
  intent: Intent,
  snapshot: Snapshot | null,
  quality: Quality,
  now: number,
): string {
  if (!snapshot || !["demo", "live"].includes(quality))
    return "当前没有可用的实时实验状态，请等待数据恢复后再查询。";
  const prefix = quality === "demo" ? "演示数据：" : "";
  const done = snapshot.samples.filter(isDone).length;
  const active = snapshot.samples.filter((s) => activeSteps(s).length);
  switch (intent) {
    case "experiment":
      return `${prefix}当前是${snapshot.name}，${statusLabels[snapshot.status]}。通过配液、聚合反应、取样检测、离心清洗和烘干完成微球制备。`;
    case "step":
      return `${prefix}${statusLabels[snapshot.status]}。${
        active.length
          ? active
              .slice(0, 3)
              .map((s) => `${s.id} ${actionLabel(s)}`)
              .join("；") +
            (active.length > 3
              ? `；另有 ${active.length - 3} 个样本并行处理中`
              : "")
          : "目前没有执行中的步骤"
      }。`;
    case "count":
      return `${prefix}本批共有 ${snapshot.samples.length} 个样本，已完成 ${done} 个，处理中 ${active.length} 个，等待 ${snapshot.samples.length - done - active.length} 个。`;
    case "time": {
      const mins = remainingMinutes(snapshot, now);
      return `${prefix}${snapshot.status === "finished" ? "本批实验已完成。" : mins === null ? "剩余时间暂时无法估算。" : `预计还需要 ${mins} 分钟，实际结束时间以设备状态为准。`}`;
    }
    case "quality": {
      const r = snapshot.result;
      return `${prefix}${r ? `${r.sampleId} 最近一次检测的平均粒径为 ${r.mean} 微米，变异系数为 ${r.cv}%，统计了 ${r.count} 个颗粒。${r.verdict && r.rule ? `根据 ${r.rule}，结果为${r.verdict}。` : "尚未提供质量判定规则，暂不判断是否合格。"}` : "目前还没有检测结果。"}`;
    }
  }
}
