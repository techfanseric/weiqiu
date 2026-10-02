<template>
  <section class="lx-panel data-card">
    <header class="lx-panel-head">
      <span class="lx-panel-title">视觉颗粒数据</span>
      <div class="lx-panel-extra">
        <RefreshTime :time="blockUpdatedAt.vision" :loading="blockLoading.vision" @refresh="refreshBlock('vision')" />
      </div>
    </header>

    <div class="lx-panel-body vision-body">
      <div v-if="isEmpty" class="lx-empty">
        <a-empty description="暂无视觉数据" />
      </div>

      <template v-else>
        <!-- 关键指标 -->
        <div class="metric-list">
          <div v-for="m in data.metrics" :key="m.label" class="metric-item">
            <div class="metric-value">
              {{ m.value }}<span v-if="m.unit" class="metric-unit">{{ m.unit }}</span>
            </div>
            <div class="metric-label">{{ m.label }}</div>
          </div>
        </div>

        <!-- 粒径分布 -->
        <div class="dist-block">
          <div class="dist-head">
            <span>粒径分布</span>
            <span class="dist-sub">μm / 个</span>
          </div>
          <div class="dist-chart">
            <div
              v-for="b in data.distribution"
              :key="b.label"
              class="bar-col"
              :title="`${b.label} μm：${b.value} 个`"
            >
              <div class="bar" :style="{ height: barHeight(b.value) }"></div>
            </div>
          </div>
          <div class="dist-axis">
            <span v-for="b in data.distribution" :key="b.label">{{ b.label }}</span>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style lang="less" scoped>
.data-card{
  width: 100%;
}
.vision-body{
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
/* ===== 关键指标 ===== */
.metric-list{
  flex-shrink: 0;
  display: flex;
  border: 1px solid var(--lx-hairline, var(--color-border-1));
  border-radius: var(--lx-r-sm, 6px);
  background: var(--lx-surface-2, var(--color-fill-1));
  overflow: hidden;
}
.metric-item{
  flex: 1;
  min-width: 0;
  padding: 9px 4px;
  text-align: center;
  & + .metric-item{
    border-left: 1px solid var(--lx-hairline, var(--color-border-1));
  }
}
.metric-value{
  font-family: var(--lx-mono, monospace);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--lx-text-1, var(--color-text-1));
  white-space: nowrap;
  .metric-unit{
    font-family: inherit;
    font-size: 0.58rem;
    font-weight: 400;
    letter-spacing: 0;
    color: var(--lx-text-3, var(--color-text-3));
    margin-left: 3px;
  }
}
.metric-label{
  font-size: 0.6rem;
  color: var(--lx-text-3, var(--color-text-3));
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* ===== 粒径分布 ===== */
.dist-block{
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.dist-head{
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.62rem;
  color: var(--lx-text-2, var(--color-text-2));
  margin-bottom: 8px;
  .dist-sub{
    font-family: var(--lx-mono, monospace);
    font-size: 0.56rem;
    color: var(--lx-text-3, var(--color-text-3));
  }
}
.dist-chart{
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  border-bottom: 1px solid var(--lx-hairline, var(--color-border-1));
}
.bar-col{
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bar{
  width: 100%;
  max-width: 26px;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, var(--lx-accent-2, #7C86E8) 0%, rgba(94, 106, 210, 0.35) 100%);
  transition: height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.bar-col:hover .bar{
  background: linear-gradient(180deg, #9AA3FF 0%, rgba(124, 134, 232, 0.6) 100%);
}
.dist-axis{
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  padding-top: 6px;
  span{
    flex: 1;
    min-width: 0;
    text-align: center;
    font-family: var(--lx-mono, monospace);
    font-size: 0.52rem;
    color: var(--lx-text-3, var(--color-text-3));
    white-space: nowrap;
    transform: scale(0.92);
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { blockLoading, blockUpdatedAt, refreshBlock, visionData } from '@/hooks/dashboard';
import RefreshTime from './refresh-time.vue';

// 推送数据为空时用示例数据兜底
const data = computed<any>(() => visionData.value);

// 该块无数据
const isEmpty = computed(() => !data.value?.metrics?.length && !data.value?.distribution?.length);

const maxValue = computed(() => {
  const list = data.value?.distribution || [];
  return Math.max(...list.map((b: any) => b.value), 1);
});

const barHeight = (value: number) => `${Math.max(8, Math.round((value / maxValue.value) * 100))}%`;
</script>
