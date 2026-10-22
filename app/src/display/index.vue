<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import machine from "@/assets/generated/microsphere-workcell.png";
import logo from "@/assets/brand/siat-logo.png";
import assistantV1 from "@/assets/generated/lab-assistant-v1.png";
import assistantV2 from "@/assets/generated/lab-assistant-v2.png";
import assistantV3 from "@/assets/generated/lab-assistant-v3.png";
import assistantV4 from "@/assets/generated/lab-assistant-v4.png";
import { useDisplay } from "./useDisplay";
import { useVoice } from "./useVoice";
import ScrollingCaption from "./ScrollingCaption.vue";
import AssistantMascot from "./AssistantMascot.vue";
import {
  stages,
  statusLabels,
  activeSteps,
  actionLabel,
  isDone,
  remainingMinutes,
  timelineBounds,
  questions,
  type Stage,
} from "./model";
const { demo, count, elapsed, demoStatus, now, snapshot, quality, issue } =
  useDisplay();
const route = useRoute();
const router = useRouter();
const assistantVariants = [
  { id: "classic", label: "蓝晶伙伴", image: assistantV1 },
  { id: "ceramic", label: "白瓷伙伴", image: assistantV2 },
  { id: "illustrated", label: "轻绘精灵", image: assistantV3 },
  { id: "glass", label: "晶透助手", image: assistantV4 },
];
const assistantStyle = computed({
  get: () => assistantVariants.find((v) => v.id === route.query.assistant)?.id || "classic",
  set: (value: string) => {
    router.replace({ query: { ...route.query, assistant: value === "classic" ? undefined : value } });
  },
});
const selectedAssistant = computed(() => assistantVariants.find((v) => v.id === assistantStyle.value)!);
const assistant = computed(() => selectedAssistant.value.image);
const layout = computed({
  get: () => demo.value && route.query.layout === "machine-right" ? "machine-right" : "standard",
  set: (value: string) => {
    router.replace({
      query: { ...route.query, layout: value === "machine-right" ? value : undefined },
    });
  },
});
const {
  phase, caption, captionId, highlight, muted, supported,
  ask, begin, end, stop, setCaptionReading, pauseCaption,
} = useVoice(snapshot, quality, now);
type AssistantState = "idle" | "listening" | "thinking" | "speaking";
const animationStates: { id: AssistantState; label: string }[] = [
  { id: "idle", label: "待机" }, { id: "listening", label: "聆听" },
  { id: "thinking", label: "思考" }, { id: "speaking", label: "说话" },
];
const previewState = ref<AssistantState | "auto">("auto");
const cycling = ref(false);
let animationTimer: ReturnType<typeof setInterval> | undefined;
const assistantState = computed<AssistantState>(() =>
  previewState.value !== "auto" ? previewState.value : phase.value === "error" ? "idle" : phase.value,
);
const assistantStateLabel = computed(() => animationStates.find((s) => s.id === assistantState.value)!.label);
function setPreview(state: AssistantState | "auto") {
  clearInterval(animationTimer);
  animationTimer = undefined;
  cycling.value = false;
  previewState.value = state;
}
function toggleCycle() {
  if (cycling.value) { setPreview("auto"); return; }
  setPreview("idle");
  cycling.value = true;
  let index = 0;
  animationTimer = setInterval(() => {
    index = (index + 1) % animationStates.length;
    previewState.value = animationStates[index].id;
  }, 3000);
}
function closeAssistant() { help.value = false; setPreview("auto"); }
function beginVoice() { setPreview("auto"); help.value = false; begin(); }
function askQuestion(intent: Parameters<typeof ask>[0]) {
  setPreview("auto"); help.value = false; ask(intent);
}
watch(phase, (value) => { if (value !== "idle") setPreview("auto"); });
onUnmounted(() => clearInterval(animationTimer));
const scale = ref(1);
const settings = ref(false);
const help = ref(false);
function toggleHelp() {
  if (help.value) { closeAssistant(); return; }
  setPreview("auto");
  stop();
  help.value = true;
}
const fullscreenError = ref("");
function resize() {
  scale.value = Math.min(innerWidth / 1920, innerHeight / 1080);
}
onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
});
onUnmounted(() => window.removeEventListener("resize", resize));
const valid = computed(() => ["demo", "live"].includes(quality.value));
const effectiveNow = computed(() =>
  demo.value || !valid.value
    ? snapshot.value?.serverTime || now.value
    : now.value,
);
const qualityLabels = {
  demo: "演示数据",
  live: "实时数据",
  stale: "数据已过期",
  offline: "连接已断开",
  waiting: "等待实验数据",
};
const samples = computed(() => snapshot.value?.samples || []);
const done = computed(() => samples.value.filter(isDone).length);
const running = computed(
  () => samples.value.filter((s) => activeSteps(s).length).length,
);
const remaining = computed(() =>
  valid.value ? remainingMinutes(snapshot.value, effectiveNow.value) : null,
);
const result = computed(() => snapshot.value?.result);
const bounds = computed(() =>
  snapshot.value
    ? timelineBounds(snapshot.value)
    : { start: now.value, end: now.value + 7200000 },
);
const pct = (at: number) =>
  Math.max(
    0,
    Math.min(
      100,
      ((at - bounds.value.start) / (bounds.value.end - bounds.value.start)) *
        100,
    ),
  );
const time = (at: number) =>
  new Date(at).toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
const ticks = computed(() =>
  Array.from({ length: 7 }, (_, i) => ({
    position: (i / 6) * 100,
    label: time(
      bounds.value.start + ((bounds.value.end - bounds.value.start) * i) / 6,
    ),
  })),
);
const activeStageIds = computed(
  () =>
    new Set(samples.value.flatMap((s) => activeSteps(s).map((t) => t.stage))),
);
const regionData: { id: Stage; x: number; y: number; label: string }[] = [
  { id: "prepare", x: 23, y: 56, label: "配液与混合" },
  { id: "react", x: 44, y: 20, label: "聚合反应" },
  { id: "detect", x: 78, y: 24, label: "粒径检测" },
  { id: "wash", x: 67, y: 51, label: "离心清洗" },
  { id: "dry", x: 91, y: 43, label: "最终烘干" },
];
const zones: { id: Stage; points: string }[] = [
  { id: "prepare", points: "205,386 447,317 653,596 444,714 214,532" },
  { id: "react", points: "568,257 951,187 1010,331 677,433" },
  { id: "detect", points: "1042,251 1202,213 1282,328 1139,390" },
  { id: "wash", points: "999,404 1147,370 1270,553 1107,611" },
  { id: "dry", points: "1169,355 1344,392 1434,518 1267,571" },
];
const regionSamples = (id: Stage) =>
  samples.value
    .filter((s) => activeSteps(s).some((t) => t.stage === id))
    .map((s) => s.id);
const displayStatus = computed(() =>
  !valid.value
    ? qualityLabels[quality.value]
    : snapshot.value
      ? statusLabels[snapshot.value.status]
      : "等待实验",
);
const phaseLabels = {
  idle: "实验助手",
  listening: "正在聆听",
  thinking: "正在识别",
  speaking: "正在回答",
  error: "请重试",
};
const maxBin = computed(() =>
  Math.max(1, ...(result.value?.distribution.map((b) => b.count) || [])),
);
const currentX = computed(() => pct(effectiveNow.value));
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    fullscreenError.value = "请使用浏览器全屏快捷键";
  }
}
const transportNote = computed(() =>
  quality.value === "demo"
    ? "演示模式 · 未连接设备"
    : quality.value === "live"
      ? "状态来自实验服务"
      : snapshot.value
        ? `最后有效数据 ${time(snapshot.value.serverTime)}`
        : issue.value || "尚未收到实验快照",
);
</script>

<template>
  <main class="display-viewport">
    <div
      class="display-canvas"
      :style="{ transform: `translate(-50%, -50%) scale(${scale})` }"
      :class="{ 'is-muted-data': !valid, 'layout-machine-right': layout === 'machine-right' }"
    >
      <header class="display-header">
        <div class="institute">
          <img :src="logo" alt="中国科学院深圳先进技术研究院" />
        </div>
        <div class="platform-title">
          <span>微球智能制备平台</span><small>MICROSPHERE AUTOMATION</small>
        </div>
        <div class="header-right">
          <span class="source-badge" :class="quality"
            ><i></i>{{ qualityLabels[quality] }}</span
          ><time>{{ time(now) }}</time
          ><button
            class="icon-button"
            aria-label="全屏显示"
            @click="fullscreen"
          >
            <svg viewBox="0 0 24 24">
              <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
            </svg></button
          ><button
            v-if="demo"
            class="icon-button"
            :aria-expanded="settings"
            aria-label="演示设置"
            @click="settings = !settings"
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 7h16M4 17h16M8 4v6m8 4v6" />
            </svg>
          </button>
        </div>
      </header>

      <section
        class="experiment-heading"
        :class="{ spotlight: highlight === 'experiment' }"
        aria-label="实验概览"
      >
        <div class="experiment-name">
          <div class="eyebrow">
            AUTONOMOUS LABORATORY
            <span>{{ snapshot?.runId || "等待批次" }}</span>
          </div>
          <h1>{{ snapshot?.name || "等待微球制备实验" }}</h1>
        </div>
        <div class="run-state" :class="snapshot?.status">
          <i :class="{ pulse: valid && snapshot?.status === 'running' }"></i
          >{{ displayStatus }}
        </div>
        <div class="summary-stat" :class="{ spotlight: highlight === 'count' }">
          <span>完成样本</span
          ><strong
            >{{ done.toString().padStart(2, "0")
            }}<em
              >/ {{ samples.length.toString().padStart(2, "0") }}</em
            ></strong
          >
        </div>
        <div class="summary-stat" :class="{ spotlight: highlight === 'time' }">
          <span>预计剩余</span
          ><strong
            >{{ remaining ?? "—"
            }}<em>{{
              remaining !== null
                ? "分钟"
                : snapshot?.status === "finished"
                  ? "已完成"
                  : "待估算"
            }}</em></strong
          >
        </div>
      </section>

      <div class="display-middle">
        <section
          class="machine-panel"
          :class="{ spotlight: highlight === 'step' }"
          aria-label="机台区域示意"
        >
          <div class="section-heading">
            <h2><span>01</span> 机台全景</h2>
            <div class="small-note">
              <i class="legend-dot"></i
              >{{
                valid
                  ? `${activeStageIds.size} 个区域${snapshot?.status === "running" ? "处理中" : "保留当前任务"}`
                  : "区域状态待同步"
              }}
            </div>
          </div>
          <div class="machine-stage">
            <div class="machine-scene">
              <img
                :src="machine"
                class="machine-image"
                alt="重新制作的双机械臂微球制备机台示意，左侧配液、中后部反应、右侧检测与清洗烘干"
              />
              <svg
                class="machine-zones"
                viewBox="0 0 1536 1024"
                aria-hidden="true"
              >
                <polygon
                  v-for="zone in zones"
                  :key="zone.id"
                  :points="zone.points"
                  :class="{
                    active: valid && activeStageIds.has(zone.id),
                    moving: valid && snapshot?.status === 'running',
                  }"
                />
              </svg>
              <div
                v-for="(region, index) in regionData"
                :key="region.id"
                class="machine-region"
                :class="{
                  active: valid && activeStageIds.has(region.id),
                  animated:
                    valid &&
                    snapshot?.status === 'running' &&
                    activeStageIds.has(region.id),
                }"
                :style="{ left: `${region.x}%`, top: `${region.y}%` }"
              >
                <span class="region-pin">{{
                  String(index + 1).padStart(2, "0")
                }}</span>
                <div class="region-label">
                  <b>{{ region.label }}</b
                  ><span>{{
                    valid && regionSamples(region.id).length
                      ? regionSamples(region.id).join(" / ")
                      : "—"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="caption"
            class="process-note assistant-note"
            role="status"
            aria-live="polite"
          >
            <span class="caption-assistant"><AssistantMascot :src="assistant" :state="assistantState" compact />实验助手</span>
            <ScrollingCaption
              :key="captionId"
              :text="caption"
              @reading="setCaptionReading"
              @pause="pauseCaption"
            />
            <button
              class="caption-dismiss"
              type="button"
              aria-label="关闭字幕并停止播报"
              @click="stop"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
              <span>关闭</span>
            </button>
          </div>
          <div v-else class="process-note">
            <span>工艺说明</span>
            <p>反应过程中取样检测，离心与清洗循环 3 次后进入烘干。</p>
            <small>设备示意 · 区域待现场校准</small>
          </div>
        </section>

        <section
          class="result-panel"
          :class="{ spotlight: highlight === 'quality' }"
          aria-label="颗粒检测结果"
        >
          <div class="section-heading">
            <h2><span>02</span> 颗粒检测</h2>
            <span class="result-sample">{{
              result?.sampleId || "待检测"
            }}</span>
          </div>
          <template v-if="result">
            <div class="result-metrics">
              <div>
                <span>平均粒径</span
                ><strong>{{ result.mean.toFixed(1) }}<small>μm</small></strong>
              </div>
              <div>
                <span>变异系数 CV</span
                ><strong>{{ result.cv.toFixed(1) }}<small>%</small></strong>
              </div>
            </div>
            <div class="distribution-title">
              <span>粒径分布</span
              ><span>{{ result.count.toLocaleString() }} 个颗粒</span>
            </div>
            <div
              class="distribution"
              role="img"
              :aria-label="
                result.distribution
                  .map((b) => `${b.label} 微米 ${b.count} 个`)
                  .join('，')
              "
            >
              <div
                v-for="bin in result.distribution"
                :key="bin.label"
                class="distribution-bin"
              >
                <span>{{ bin.count }}</span>
                <div
                  :style="{ height: `${(bin.count / maxBin) * 90}px` }"
                ></div>
                <small>{{ bin.label }}</small>
              </div>
            </div>
            <div class="result-verdict">
              <span>{{
                result.verdict && result.rule
                  ? result.verdict
                  : "质量判定待确认"
              }}</span
              ><small>{{ result.rule || "尚未配置质量判定规则" }}</small>
            </div>
            <p class="measurement-note">
              {{ !valid ? "历史检测 · " : "" }}检测于
              {{ time(result.measuredAt) }} · 粒径单位 μm
            </p>
          </template>
          <div v-else class="result-empty">
            <svg viewBox="0 0 100 80">
              <circle cx="36" cy="35" r="20" />
              <circle cx="71" cy="23" r="10" />
              <circle cx="68" cy="57" r="13" />
              <circle cx="22" cy="67" r="5" />
            </svg>
            <h3>等待第一份检测结果</h3>
            <p>完成取样与显微成像后，<br />这里将呈现对应样本的粒径分布。</p>
          </div>
        </section>
      </div>

      <section
        class="timeline-panel"
        :class="{ spotlight: highlight === 'step' || highlight === 'count' }"
        aria-label="样本并行时间线"
      >
        <div class="section-heading">
          <h2>
            <span>03</span> 样本进程
            <small
              >{{ running }} 个{{
                snapshot?.status === "paused"
                  ? "已暂停"
                  : snapshot?.status === "error"
                    ? "待确认"
                    : "处理中"
              }}
              · {{ done }} 个已完成</small
            >
          </h2>
          <div class="stage-legend">
            <span v-for="stage in stages" :key="stage.id"
              ><i :style="{ background: stage.color }"></i
              >{{ stage.short }}</span
            ><span class="planned-key">虚线为计划</span>
          </div>
        </div>
        <div
          v-if="samples.length"
          class="gantt"
          :class="{ 'ten-samples': samples.length > 6 }"
        >
          <div class="gantt-axis">
            <span>样本 / 当前动作</span>
            <div>
              <span
                v-for="tick in ticks"
                :key="tick.position"
                :style="{ left: `${tick.position}%` }"
                >{{ tick.label }}</span
              >
            </div>
          </div>
          <div class="gantt-rows">
            <div v-for="sample in samples" :key="sample.id" class="gantt-row">
              <div class="sample-description">
                <strong>{{ sample.id }}</strong
                ><span :class="{ complete: isDone(sample) }">{{
                  actionLabel(sample)
                }}</span>
              </div>
              <div class="gantt-track">
                <div
                  v-for="tick in ticks"
                  :key="tick.position"
                  class="gridline"
                  :style="{ left: `${tick.position}%` }"
                ></div>
                <div
                  v-for="step in sample.steps"
                  :key="step.id"
                  class="gantt-bar"
                  :class="[
                    step.status,
                    step.stage,
                    { overlay: step.stage === 'detect' },
                  ]"
                  :style="{
                    left: `${pct(step.start)}%`,
                    width: `${pct(step.end) - pct(step.start)}%`,
                    '--stage-color': stages.find((s) => s.id === step.stage)
                      ?.color,
                  }"
                  :aria-label="`${sample.id} ${step.label} ${step.status} ${time(step.start)}至${time(step.end)}`"
                >
                  <span v-if="pct(step.end) - pct(step.start) > 12">{{
                    stages.find((s) => s.id === step.stage)?.short
                  }}</span
                  ><b v-if="step.status === 'done' && step.stage !== 'detect'"
                    >✓</b
                  >
                </div>
                <div class="now-line" :style="{ left: `${currentX}%` }"></div>
              </div>
            </div>
          </div>
          <div class="timeline-caption">
            <span>检测条与反应条重叠，表示反应中取样</span
            ><span
              >{{ valid ? "当前" : "最后状态" }} {{ time(effectiveNow) }} ·
              全流程自适应</span
            >
          </div>
        </div>
        <div v-else class="timeline-empty">
          <strong>{{ displayStatus }}</strong
          ><span>收到本批实验的样本与步骤数据后，将自动显示并行进程。</span>
        </div>
      </section>

      <footer class="display-footer">
        <div class="connection-note">
          <span class="footer-dot" :class="quality"></span>{{ transportNote
          }}<small>{{ fullscreenError }}</small>
        </div>
        <div class="assistant-control">
          <button
            class="text-button"
            @click="toggleHelp"
            :aria-expanded="help"
          >
            问问助手</button
          ><button
            class="text-button"
            @click="muted = !muted"
            :aria-pressed="muted"
          >
            {{ muted ? "已静音" : "语音播报" }}</button
          ><button
            class="voice-button"
            :class="[assistantState, { 'is-preview': previewState !== 'auto' }]"
            @pointerdown="
              ($event.currentTarget as HTMLElement).setPointerCapture(
                $event.pointerId,
              );
              beginVoice();
            "
            @pointerup="end"
            @pointercancel="end"
            @keydown.space.prevent="!$event.repeat && beginVoice()"
            @keyup.space.prevent="end"
            @keydown.enter.prevent="!$event.repeat && beginVoice()"
            @keyup.enter.prevent="end"
            @blur="end"
            :aria-label="
              supported
                ? '按住说话，松开结束'
                : '语音识别不可用，可使用常见问题'
            "
          >
            <span class="assistant-avatar"><AssistantMascot :src="assistant" :state="assistantState" compact /></span
            ><span
              >{{ previewState !== "auto" ? `预览 · ${assistantStateLabel}` : phaseLabels[phase]
              }}<small>{{
                previewState !== "auto"
                  ? "动效预览 · 未开启收音"
                  : phase === "idle"
                  ? "按住说话 / 空格键"
                  : phase === "listening"
                    ? "松开结束"
                    : "仅查询实验状态"
              }}</small></span
            >
          </button>
        </div>
      </footer>

      <section v-if="help" class="questions-popover assistant-dialog" role="dialog" aria-labelledby="assistant-title" @keydown.esc="closeAssistant">
        <button class="assistant-close icon-button" aria-label="收起实验助手" @click="closeAssistant">
          <svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <div class="assistant-welcome">
          <div class="assistant-portrait"><AssistantMascot :src="assistant" :state="assistantState" /></div>
          <span class="assistant-kicker" role="status">{{ previewState === "auto" ? "你的实验小伙伴" : `动效预览 · ${assistantStateLabel}` }}</span>
          <h2 id="assistant-title">你好，我是实验助手</h2>
          <p>一起看看，实验进行到哪里了。</p>
        </div>
        <div class="assistant-suggestions">
          <span class="suggestion-heading">你可以这样问我</span>
          <button v-for="q in questions" :key="q.intent" @click="askQuestion(q.intent)">
            {{ q.label }}<span aria-hidden="true">↗</span>
          </button>
        </div>
        <div class="assistant-variant-picker" role="group" aria-label="助手形象选择">
          <div class="assistant-variant-heading"><span>助手形象</span><small>点击切换，看看你更喜欢哪一种</small></div>
          <div class="assistant-variants">
            <button v-for="variant in assistantVariants" :key="variant.id" type="button"
              :aria-pressed="assistantStyle === variant.id" :aria-label="`切换为${variant.label}`"
              @click="assistantStyle = variant.id">
              <img :src="variant.image" alt="" /><span>{{ variant.label }}</span>
            </button>
          </div>
        </div>
        <div class="assistant-animation-picker">
          <div class="assistant-variant-heading"><span>动效预览</span><button class="cycle-preview" type="button" :aria-pressed="cycling" @click="toggleCycle">{{ cycling ? "停止循环" : "循环演示" }}</button></div>
          <div class="assistant-state-options" role="group" aria-label="助手动效预览">
            <button type="button" :aria-pressed="previewState === 'auto'" @click="setPreview('auto')">自动</button>
            <button v-for="state in animationStates" :key="state.id" type="button" :aria-pressed="previewState === state.id" @click="setPreview(state.id)">{{ state.label }}</button>
          </div>
          <p>{{ previewState === "auto" ? "跟随实际问答状态" : "仅预览动效，不启用麦克风或语音播报" }}</p>
        </div>
        <div class="assistant-dialog-bottom"><span class="assistant-status-dot"></span>按住右下角说话，或按住空格键</div>
      </section>
      <div v-if="settings && demo" class="demo-settings">
        <div class="popover-title">
          演示场景<button
            class="text-button"
            aria-label="关闭演示设置"
            @click="settings = false"
          >
            关闭
          </button>
        </div>
        <p>以下仅调整演示场景，不向设备发送指令。</p>
        <label>
          展示布局
          <select v-model="layout" aria-label="展示布局">
            <option value="standard">布局一 · 机台在左</option>
            <option value="machine-right">布局二 · 机台在右</option>
          </select>
        </label>
        <label
          >并行样本<select v-model.number="count" aria-label="并行样本">
            <option v-for="n in 10" :value="n">{{ n }} 个样本</option>
          </select></label
        ><label
          >实验状态<select v-model="demoStatus" aria-label="实验状态">
            <option value="running">运行中</option>
            <option value="paused">已暂停</option>
            <option value="error">异常</option>
          </select></label
        ><label
          >模拟已用时间 <b>{{ Math.round(elapsed) }} 分钟</b
          ><input
            aria-label="模拟已用时间"
            v-model.number="elapsed"
            type="range"
            min="0"
            max="180" /></label
        ><a href="?preview=1#/" target="_blank" rel="noopener"
          >打开操作台预览 ↗</a
        >
      </div>
    </div>
  </main>
</template>

<style src="./display.css"></style>
