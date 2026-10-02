<template>
  <!-- 全出血控制台：负 margin 抵消 .layout-content 的 1rem 内边距，让页面与顶栏连成一片 -->
  <div class="home-console">
    <!-- ========== 左列：设备状态 + 运行日志 ========== -->
    <div class="col-left">
      <section class="lx-panel device-panel">
        <header class="lx-panel-head">
          <span class="lx-panel-title">设备状态</span><span class="console-source"><span>{{ dashboardSource }}</span></span>
          <span v-if="deviceData.length" class="lx-panel-meta">{{ deviceData.length }} 台</span>
          <div class="lx-panel-extra">
            <RefreshTime :time="blockUpdatedAt.devices" :loading="blockLoading.devices" @refresh="refreshBlock('devices')" />
          </div>
        </header>

        <div v-if="deviceData.length" class="device-grid">
          <div v-for="item in deviceData" :key="item.name" class="device-cell">
            <div class="dev-name" :title="item.name">{{ item.name }}</div>
            <div v-if="item.children" class="dev-params">
              <div v-for="(param, index) in item.children" :key="index" class="dev-row">
                <span class="dev-k">{{ param.name }}</span>
                <span class="dev-v" :class="`is-${param.status || 'normal'}`">{{ param.value }}</span>
              </div>
            </div>
            <div v-else class="dev-single">{{ item.value }}</div>
          </div>
        </div>
        <div v-else class="lx-empty">
          <a-empty description="暂无设备数据" />
        </div>
      </section>

      <div class="log-panel">
        <Log />
      </div>
    </div>

    <!-- ========== 右列：运行任务 / 视觉颗粒数据 / 实验数据 ========== -->
    <div class="col-right">
      <TaskTable title="运行任务" class="task-slot" />
      <VisionPanel class="grow-slot" />
      <ExperimentPanel class="grow-slot exp-slot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { dashboardSource, blockLoading, blockUpdatedAt, deviceData, refreshBlock } from '@/hooks/dashboard';
import TaskTable from './components/task-table.vue';
import VisionPanel from './components/vision-panel.vue';
import ExperimentPanel from './components/experiment-panel.vue';
import RefreshTime from './components/refresh-time.vue';
import Log from './components/log.vue';
</script>


<style lang="less" scoped>
.home-console{
  /* 抵消 .layout-content 的 padding，全出血铺满内容区 */
  width: calc(100% + 2rem);
  height: calc(100% + 2rem);
  margin: -1rem;
  padding: 14px;
  box-sizing: border-box;
  background: var(--lx-ground, var(--color-bg-1));
  display: flex;
  gap: 12px;
  overflow: hidden;
}

/* ===== 左列：设备状态 + 运行日志，flex 2 ===== */
.col-left{
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
/* 设备面板吃掉左列剩余高度（设备多时行内滚动），不再被日志挤成一截 */
.device-panel{
  flex: 1 1 auto;
  min-height: 0;
}
/* 日志是底部"横条"：给固定占比，不再 flex:1 吞掉整列 3/4 高度。
   27% 时正文正好 8 行（行高 28px 定高，见 log.vue） */
.log-panel{
  flex: 0 0 auto;
  height: 27%;
  min-height: 190px;
  max-height: 300px;
  display: flex;
}

/* 设备卡片瓦片：
   - 自绘卡片（1px 发丝边框 + 单层 surface + 6px 圆角），不用 a-card，也不做卡片套卡片
   - 列数随推送数量/面板宽度自适应（auto-fit），设备少时卡片变宽铺满，不为空列留白
   - 行数 = 设备数 ÷ 列数，行高由内容决定（148px 起），装不下时面板内滚动 */
.device-grid{
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(216px, 1fr));
  /* 行高 148px 起（能放 1 行设备名 + 3 行参数还有余量），参数更多时按内容生长；
     行数 = 推送设备数 / 列数，多到装不下时面板内滚动 */
  grid-auto-rows: minmax(148px, auto);
  align-content: safe center;   /* 卡片组整体垂直居中；行数溢出时自动回退到顶部 */
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
}
.device-cell{
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 11px 13px;
  background: var(--lx-surface-2, var(--color-fill-2));
  border: 1px solid var(--lx-hairline, var(--color-border-1));
  border-radius: var(--lx-r-sm, 6px);
  transition: background 0.15s ease, border-color 0.15s ease;
  &:hover{
    background: var(--lx-surface-3, var(--color-fill-3));
    border-color: var(--lx-hairline-2, var(--color-border-2));
  }
}
.dev-name{
  flex: 0 0 auto;
  font-size: 0.66rem;
  letter-spacing: 0.02em;
  color: var(--lx-text-2, var(--color-text-2));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 参数组撑满卡片剩余高度：卡片被拉高时按 space-around 均分，不会被顶到一边 */
.dev-params{
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 4px;
}
.dev-row{
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.66rem;
}
.dev-k{
  min-width: 0;
  color: var(--lx-text-3, var(--color-text-3));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dev-v{
  font-family: var(--lx-mono, monospace);
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--lx-text-1, var(--color-text-1));
  white-space: nowrap;
  &.is-warn{
    color: var(--lx-warn, rgb(var(--orange-6)));
  }
  &.is-error{
    color: var(--lx-danger, rgb(var(--red-6)));
  }
}
.dev-single{
  flex: 1;
  display: flex;
  align-items: center;
  font-family: var(--lx-mono, monospace);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--lx-text-1, var(--color-text-1));
}

/* ===== 右列：运行任务 / 视觉颗粒数据 / 实验数据，flex 1 ===== */
.col-right{
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
.task-slot{
  flex: 0 0 auto;
}
.grow-slot{
  flex: 1;
  min-height: 0;
}
.exp-slot{
  flex: 1.35;
}
</style>
