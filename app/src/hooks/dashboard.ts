import { createDemo, stages, activeSteps } from "@/display/model";
import { isPreview } from "@/runtime";
/**
 * 首页看板统一数据源
 *
 * 数据链路（参考 deviceStatus 的写法）：
 *   MQTT /data/notification/changed 推送 → 写入 ref + localStorage
 *   页面初始化 → 从 localStorage 读取；读不到 → 保持空态；仅开发预览显式使用演示数据
 *
 * 刷新（点击卡片右上角「更新时间」）：
 *   POST /backend/flow/section { flow_id: 85, name } 触发后端推送该块数据
 *   四张卡片各自独立（name 见 BLOCK_TRIGGER_NAMES），点哪张只刷哪张
 *
 * 约定：运行任务 / 视觉颗粒数据 / 实验数据属于同一条数据链（同一实验批次：
 *  任务执行 → 视觉采集 → 实验结论），共用 updatedAt 与实验编号，
 *  因此收敛为一个 payload，一次推送即可整体更新。
 */
import { computed, reactive, ref } from "vue";
import dayjs from "dayjs";
import { Message } from "@arco-design/web-vue";
import { deviceStatus } from "@/hooks/main";
import api from "@/api";

/* ==================== 类型定义 ==================== */

/** 设备状态：单条参数 */
export interface DeviceStatusChild {
  /** 参数名，如「当前温度」 */
  name: string;
  /** 参数值（含单位），如「72.4 ℃」 */
  value: string;
  /** normal 正常(默认) / warn 预警 / error 异常 */
  status?: "normal" | "warn" | "error";
}

/** 设备状态：单台设备 */
export interface DeviceStatusItem {
  name: string;
  /** 无 children 时直接展示的单值 */
  value?: string;
  children?: DeviceStatusChild[];
}

/** 运行任务 */
export interface TaskData {
  /** running 运行中 / paused 暂停 / idle 空闲 / finished 已完成 */
  status?: "running" | "paused" | "idle" | "finished";
  /** 任务编号，如 TASK-000089-11 */
  taskId?: string;
  /** 任务名（流程名），如「微球粒径检测流程」 */
  flowName?: string;
  /** 当前样本 */
  sample?: string;
  /** 批次进度 */
  batch?: { done: number; total: number };
  /** 预留：当前步骤 */
  stepName?: string;
  stepIndex?: number;
  stepTotal?: number;
}

/** 视觉颗粒数据 */
export interface VisionMetric {
  label: string;
  value: string;
  unit?: string;
}

export interface VisionBin {
  /** 粒径区间标签，如「40-50」 */
  label: string;
  /** 该区间颗粒数 */
  value: number;
}

export interface VisionData {
  /** 关键指标（建议 4 项） */
  metrics: VisionMetric[];
  /** 粒径分布直方图 */
  distribution: VisionBin[];
}

export type ExperimentResult = "合格" | "不合格" | "待检" | "待判定";

export interface ExperimentRecord {
  /** 样本编号，如 S-01 */
  id: string;
  /** 粒径 μm */
  size: string;
  /** 浓度 ×10⁶/mL */
  concentration: string;
  /** 荧光强度 */
  fluorescence: string;
  result: ExperimentResult;
}

/** 实验数据 */
export interface ExperimentData {
  /** 概览指标（建议 3 项） */
  summary: { label: string; value: string }[];
  /** 检测记录 */
  records: ExperimentRecord[];
}

/** 首页看板整包数据 */
export interface DashboardPayload {
  /** 整包更新时间 YYYY-MM-DD HH:mm:ss */
  updatedAt: string;
  /** 实验编号（贯穿运行任务 / 实验数据） */
  experimentNo?: number;
  /** 设备状态 */
  devices?: DeviceStatusItem[];
  /** 运行任务 */
  task?: TaskData | null;
  /** 视觉颗粒数据 */
  vision?: VisionData;
  /** 实验数据 */
  experiment?: ExperimentData;
}

/* ==================== 数据块与触发推送 ==================== */

/** 看板数据块：四张卡片各管一块，刷新时互不影响 */
export type DashboardBlock = "devices" | "task" | "vision" | "experiment";

/** 各数据块触发后端推送的 name（POST /backend/flow/section { flow_id, name }） */
export const BLOCK_TRIGGER_NAMES: Record<DashboardBlock, string> = {
  devices: "获取设备参数",
  task: "获取运行任务",
  vision: "获取视觉颗粒数据",
  experiment: "获取实验数据",
};

/** 各数据块名称（提示文案用） */
export const BLOCK_LABELS: Record<DashboardBlock, string> = {
  devices: "设备状态",
  task: "运行任务",
  vision: "视觉颗粒数据",
  experiment: "实验数据",
};

/** 触发数据推送所在的 flow id（POST /backend/flow/section） */
export const DASHBOARD_FLOW_ID = 85;

/* ==================== 状态与读写 ==================== */

/** 看板数据在 localStorage 中的 key */
export const DASHBOARD_STORAGE_KEY = "dashboardData";

const now = () => dayjs().format("YYYY-MM-DD HH:mm:ss");

/** 读取 localStorage 中的看板数据 */
const readStorage = (): DashboardPayload | null => {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch (error) {
    console.log("read dashboard storage error", error);
    return null;
  }
};

const preview = createDemo(5, 83, "running");
const localDashboard = isPreview ? null : readStorage();
export const dashboardSource = ref(
  isPreview
    ? "演示数据"
    : localDashboard || deviceStatus.value.length
      ? "缓存数据 · 请核对更新时间"
      : "等待数据",
);

/** 是否已经收到过推送数据（localStorage 有数据或 MQTT 推送过） */
export const hasPushedData = ref(!!localDashboard);

/** 看板整包数据：缓存保留原更新时间，不自动回退演示值 */
export const dashboardData = ref<DashboardPayload>({
  updatedAt: localDashboard?.updatedAt || "",
  experimentNo: localDashboard?.experimentNo,
  devices: localDashboard?.devices,
  task: localDashboard?.task || null,
  vision: localDashboard?.vision,
  experiment: localDashboard?.experiment,
});

/** 各数据块是否正在刷新（触发推送中）——点哪张卡片的「更新时间」只转哪张 */
export const blockLoading = reactive<Record<DashboardBlock, boolean>>({
  devices: false,
  task: false,
  vision: false,
  experiment: false,
});

const initialBlockTime = () => localDashboard?.updatedAt || "";

/** 各数据块更新时间（每张卡片独立，先刷先更新） */
export const blockUpdatedAt = reactive<Record<DashboardBlock, string>>({
  devices: initialBlockTime(),
  task: initialBlockTime(),
  vision: initialBlockTime(),
  experiment: initialBlockTime(),
});

/** 标记某数据块已更新（推送到达时调用） */
export const touchBlock = (block: DashboardBlock, time?: string) => {
  blockUpdatedAt[block] = time || now();
};

/**
 * 更新看板数据（MQTT 推送时调用）
 * 合并更新 → 记录更新时间 → 写入 localStorage
 */
export const updateDashboard = (partial: Partial<DashboardPayload>) => {
  if (!partial || typeof partial !== "object") return;
  hasPushedData.value = true;
  dashboardSource.value = "已接收推送";
  dashboardData.value = {
    ...(partial.experimentNo != null &&
    partial.experimentNo !== dashboardData.value.experimentNo
      ? {}
      : dashboardData.value),
    ...partial,
    updatedAt: partial.updatedAt || now(),
  };
  // 记录推送命中的数据块（未指明具体块时视为整包更新）
  const blocks: DashboardBlock[] = ["devices", "task", "vision", "experiment"];
  const touched = blocks.filter((key) => key in partial);
  (touched.length ? touched : blocks).forEach((key) =>
    touchBlock(key, partial.updatedAt),
  );
  try {
    localStorage.setItem(
      DASHBOARD_STORAGE_KEY,
      JSON.stringify(dashboardData.value),
    );
  } catch (error) {
    console.log("set dashboard storage error", error);
  }
};

/**
 * 从 localStorage 重新读取（页面初始化 / 点击「更新时间」时调用）
 * @param showMessage 是否提示结果
 */
export const loadDashboard = (showMessage = false) => {
  const data = readStorage();
  if (data) {
    hasPushedData.value = true;
    dashboardData.value = {
      ...dashboardData.value,
      ...data,
      updatedAt: data.updatedAt || "",
    };
    if (showMessage) Message.success("数据已更新");
    return true;
  }
  if (showMessage) Message.warning("暂无推送数据");
  return false;
};

/**
 * 刷新单个数据块：POST /backend/flow/section 触发后端推送该块数据
 * 推送经 changedtopic 到达 → updateDashboard 写入；请求成功只表示已下发，不修改数据更新时间
 */
export const refreshBlock = async (
  block: DashboardBlock,
  showMessage = true,
) => {
  if (isPreview) {
    if (showMessage) Message.info("本地演示不请求设备数据");
    return;
  }
  if (blockLoading[block]) return;
  blockLoading[block] = true;
  try {
    await api.flow.oneStart({
      flow_id: DASHBOARD_FLOW_ID,
      name: BLOCK_TRIGGER_NAMES[block],
    });
    // Only a received payload can advance the data timestamp.
    if (showMessage) Message.success(`${BLOCK_LABELS[block]}刷新指令已下发`);
  } catch (error: any) {
    if (showMessage)
      Message.error(error?.message ?? `${BLOCK_LABELS[block]}刷新失败`);
  } finally {
    blockLoading[block] = false;
  }
};

/* ==================== 派生数据 ==================== */

/** 空态（已收到推送但该块无数据时） */
const EMPTY_VISION: VisionData = { metrics: [], distribution: [] };
const EMPTY_EXPERIMENT: ExperimentData = { summary: [], records: [] };

/** 运行任务：仅开发预览使用演示数据 */
export const runningTask = computed<TaskData | null>(() => {
  const task = dashboardData.value?.task;
  if (task) return task;
  return isPreview
    ? {
        status: "running",
        taskId: "DEMO-PS-DVB-001",
        flowName: "PS-DVB 微球智能制备",
        sample: "S-05",
        batch: { done: 0, total: 5 },
      }
    : null;
});

/** 视觉颗粒数据：仅开发预览使用演示数据 */
export const visionData = computed<VisionData>(
  () =>
    dashboardData.value?.vision ||
    (isPreview
      ? {
          metrics: [
            { label: "检测颗粒数", value: "1,284", unit: "个" },
            { label: "平均粒径", value: "45.2", unit: "μm" },
            { label: "粒径 CV", value: "3.8", unit: "%" },
          ],
          distribution: preview.result.distribution.map((b) => ({
            label: b.label,
            value: b.count,
          })),
        }
      : EMPTY_VISION),
);

/** 实验数据：仅开发预览使用演示数据 */
export const experimentData = computed<ExperimentData>(
  () =>
    dashboardData.value?.experiment ||
    (isPreview
      ? {
          summary: [
            { label: "本批样本", value: "5" },
            { label: "已完成", value: "0" },
            { label: "最近检测", value: "S-05" },
          ],
          records: [
            {
              id: "S-05",
              size: "45.2",
              concentration: "—",
              fluorescence: "—",
              result: "待判定",
            },
          ],
        }
      : EMPTY_EXPERIMENT),
);

/** 设备状态：看板优先，其次 deviceStatus（changedtopic 推送），最后空态 */
export const deviceData = computed<DeviceStatusItem[]>(() => {
  if (isPreview)
    return [
      ...stages.map((stage) => {
        const active = preview.samples.filter((sample) =>
          activeSteps(sample).some((step) => step.stage === stage.id),
        );
        return {
          name: stage.label,
          children: [
            { name: "设备状态", value: active.length ? "运行中" : "就绪" },
            {
              name: "当前样本",
              value: active.map((s) => s.id).join(" / ") || "—",
            },
            {
              name: "当前动作",
              value: active.length ? stage.label : "等待调度",
            },
          ],
        };
      }),
      {
        name: "机械臂与轨道",
        children: [
          { name: "设备状态", value: "就绪" },
          { name: "机械臂数量", value: "2 台" },
          { name: "当前动作", value: "等待调度" },
        ],
      },
    ];
  // An explicitly empty snapshot must clear old devices rather than resurrect cache.
  if (dashboardData.value?.devices !== undefined && hasPushedData.value)
    return dashboardData.value.devices;
  if (deviceStatus.value?.length) return deviceStatus.value;
  return [];
});
