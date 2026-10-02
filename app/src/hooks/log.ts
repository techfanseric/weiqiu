import { ref } from "vue";

export const logs = ref<any>([]);


// 默认类型标签，避免缺失 type 时无法归类
const DEFAULT_LOG_TYPE = '__default__';

// 只保留每个类型的最新 500 条日志
const MAX_LOG_COUNT_PER_TYPE = 500;

// 高频日志先入队列，100ms 批量刷新一次，降低渲染频率
const LOG_FLUSH_INTERVAL_MS = 100;
const pendingLogs: any[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

const trimLogsByType = () => {
  const keptCount: Record<string, number> = {};
  const kept: any[] = [];

  // 从后往前遍历，优先保留最新的日志
  for (let i = logs.value.length - 1; i >= 0; i--) {
    const item = logs.value[i];
    const type = item?.type || DEFAULT_LOG_TYPE;
    const current = keptCount[type] ?? 0;

    if (current < MAX_LOG_COUNT_PER_TYPE) {
      keptCount[type] = current + 1;
      kept.push(item);
    }
  }

  // 反转以恢复时间顺序
  logs.value = kept.reverse();
};

export const addLogs = (newLog: any) => {
  // 没有 type 的日志丢进默认分组
  pendingLogs.push({
    ...newLog,
    type: newLog?.type || DEFAULT_LOG_TYPE,
  });

  if (!flushTimer) {
    flushTimer = setInterval(() => {
      if (pendingLogs.length === 0) return;

      // 批量写入，减少响应式触发次数
      logs.value.push(...pendingLogs.splice(0, pendingLogs.length));
      trimLogsByType();
    }, LOG_FLUSH_INTERVAL_MS);
  }
};
