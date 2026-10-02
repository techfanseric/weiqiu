<template>
  <section class="lx-panel task-card">
    <header class="lx-panel-head">
      <IconExperiment class="head-icon" />
      <span class="lx-panel-title">{{ title }}</span>
      <div class="lx-panel-extra">
        <RefreshTime :time="blockUpdatedAt.task" :loading="blockLoading.task" @refresh="refreshBlock('task')" />
      </div>
    </header>

    <div class="lx-panel-body task-body">
      <div v-if="!task" class="lx-empty">
        <a-empty description="暂无运行任务" />
      </div>

      <template v-else>
        <div class="task-id">{{ task.taskId || '—' }}</div>
        <div class="task-name" :title="task.flowName">{{ task.flowName || '—' }}</div>
        <div class="task-sample">
          <span class="sample-dot"></span>
          <span class="sample-text">样本 {{ task.sample || '—' }}</span>
        </div>

        <div class="task-progress">
          <div class="prog-head">
            <span class="prog-label">批次进度</span>
            <span class="prog-num">
              {{ progress.done }} / {{ progress.total }}<i v-if="progress.total"> · {{ progress.percent }}%</i>
            </span>
          </div>
          <div class="prog-track">
            <div class="prog-fill" :style="{ width: progress.percent + '%' }"></div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style lang="less" scoped>
.head-icon{
  flex-shrink: 0;
  color: var(--lx-text-3, var(--color-text-3));
}
.task-card{
  width: 100%;
}
.task-body{
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
}
.task-id{
  font-family: var(--lx-mono, monospace);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: var(--lx-text-3, var(--color-text-3));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-name{
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--lx-text-1, var(--color-text-1));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-sample{
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.66rem;
  color: var(--lx-text-2, var(--color-text-2));
  min-width: 0;
}
.sample-dot{
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lx-accent, rgb(var(--primary-6)));
  box-shadow: 0 0 0 3px var(--lx-accent-soft, transparent);
}
.sample-text{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-progress{
  margin-top: auto;
  padding-top: 12px;
}
.prog-head{
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}
.prog-label{
  font-size: 0.64rem;
  color: var(--lx-text-3, var(--color-text-3));
}
.prog-num{
  font-family: var(--lx-mono, monospace);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--lx-text-1, var(--color-text-1));
  white-space: nowrap;
  i{
    font-style: normal;
    color: var(--lx-accent-2, rgb(var(--primary-6)));
  }
}
.prog-track{
  height: 4px;
  border-radius: 2px;
  background: var(--lx-surface-3, var(--color-fill-3));
  overflow: hidden;
}
.prog-fill{
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--lx-accent, #5E6AD2) 0%, var(--lx-accent-2, #7C86E8) 100%);
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { blockLoading, blockUpdatedAt, refreshBlock, runningTask } from '@/hooks/dashboard';
import RefreshTime from './refresh-time.vue';

defineProps({
  title: {
    type: String,
    default: '运行任务',
  },
});

const task = computed(() => runningTask.value);

// 批次进度
const progress = computed(() => {
  const batch = task.value?.batch;
  const done = batch?.done ?? 0;
  const total = batch?.total ?? 0;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
});
</script>
