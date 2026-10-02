<template>
  <section class="lx-panel data-card">
    <header class="lx-panel-head">
      <span class="lx-panel-title">实验数据</span>
      <div class="lx-panel-extra">
        <RefreshTime :time="blockUpdatedAt.experiment" :loading="blockLoading.experiment" @refresh="refreshBlock('experiment')" />
      </div>
    </header>

    <div class="lx-panel-body exp-body">
      <div v-if="isEmpty" class="lx-empty">
        <a-empty description="暂无实验数据" />
      </div>

      <template v-else>
        <!-- 概览 -->
        <div class="summary-list">
          <div v-for="s in data.summary" :key="s.label" class="summary-item">
            <span class="summary-label">{{ s.label }}</span>
            <span class="summary-value">{{ s.value }}</span>
          </div>
        </div>

        <!-- 检测记录 -->
        <div class="exp-table">
          <div class="exp-tr exp-th">
            <span>样本</span>
            <span>粒径/μm</span>
            <span>浓度</span>
            <span>荧光强度</span>
            <span>判定</span>
          </div>
          <div v-for="r in data.records" :key="r.id" class="exp-tr">
            <span class="col-id">{{ r.id }}</span>
            <span class="col-num">{{ r.size }}</span>
            <span class="col-num">{{ r.concentration }}</span>
            <span class="col-num">{{ r.fluorescence }}</span>
            <span><i class="pill" :class="resultClass(r.result)">{{ r.result }}</i></span>
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
.exp-body{
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}
/* ===== 概览 ===== */
.summary-list{
  flex-shrink: 0;
  display: flex;
  border: 1px solid var(--lx-hairline, var(--color-border-1));
  border-radius: var(--lx-r-sm, 6px);
  background: var(--lx-surface-2, var(--color-fill-1));
  overflow: hidden;
}
.summary-item{
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  padding: 9px 4px;
  & + .summary-item{
    border-left: 1px solid var(--lx-hairline, var(--color-border-1));
  }
}
.summary-label{
  font-size: 0.6rem;
  color: var(--lx-text-3, var(--color-text-3));
  white-space: nowrap;
}
.summary-value{
  font-family: var(--lx-mono, monospace);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--lx-text-1, var(--color-text-1));
  white-space: nowrap;
}
/* ===== 记录表：发丝行分隔线，不用斑马纹 ===== */
.exp-table{
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.exp-tr{
  display: grid;
  grid-template-columns: 0.9fr 1fr 0.9fr 1.05fr 0.8fr;
  align-items: center;
  gap: 4px;
  padding: 7px 4px;
  font-size: 0.66rem;
  border-bottom: 1px solid var(--lx-hairline, var(--color-border-1));
  span{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &:last-child{
    border-bottom: none;
  }
}
.exp-th{
  color: var(--lx-text-3, var(--color-text-3));
  font-size: 0.58rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--lx-hairline-2, var(--color-border-2));
}
.col-id{
  color: var(--lx-text-1, var(--color-text-1));
  font-family: var(--lx-mono, monospace);
}
.col-num{
  color: var(--lx-text-2, var(--color-text-2));
  font-family: var(--lx-mono, monospace);
}
/* 判定：带状态点的胶囊 */
.pill{
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-style: normal;
  font-size: 0.6rem;
  line-height: 1.5;
  white-space: nowrap;
  &::before{
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
  }
}
.result-ok{
  color: var(--lx-ok, rgb(var(--green-6)));
  background: rgba(75, 208, 95, 0.14);
  border-color: rgba(75, 208, 95, 0.34);
}
.result-fail{
  color: var(--lx-danger, rgb(var(--red-6)));
  background: rgba(255, 111, 102, 0.14);
  border-color: rgba(255, 111, 102, 0.34);
}
.result-wait{
  color: var(--lx-text-3, var(--color-text-4));
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--lx-hairline, var(--color-border-1));
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { blockLoading, blockUpdatedAt, experimentData, refreshBlock } from '@/hooks/dashboard';
import RefreshTime from './refresh-time.vue';

// 推送数据为空时用示例数据兜底
const data = computed<any>(() => experimentData.value);

// 该块无数据
const isEmpty = computed(() => !data.value?.summary?.length && !data.value?.records?.length);

const resultClass = (result: string) => {
  if (result === '合格') return 'result-ok';
  if (result === '不合格') return 'result-fail';
  return 'result-wait';
};
</script>
