<style lang="less" scoped>
.log-bar{
  width: 100%;
  :deep(.lx-panel-head){
    height: 40px;
  }
}
.log-body{
  overflow: hidden;
}
.log-list{
  /* 日志从底部往上堆（终端 tail 的感觉），避免日志少时内容贴顶显得空 */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100%;
  padding: 4px 0 8px;
  /* 顶部渐隐：滚到底时最旧的那行（被裁掉半行）自然淡出，不显得像被切坏 */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 16px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 16px);
}
.log-row{
  display: flex;
  align-items: center;
  gap: 9px;
  height: 28px;
  padding: 0 12px;
  font-size: 0.64rem;
  transition: background 0.12s ease;
  &:hover{
    background: var(--lx-surface-2, var(--color-fill-2));
  }
}
.log-time{
  flex-shrink: 0;
  font-family: var(--lx-mono, monospace);
  font-size: 0.6rem;
  letter-spacing: 0.02em;
  color: var(--lx-text-3, var(--color-text-3));
}
.log-tag{
  flex-shrink: 0;
  max-width: 5.5rem;
  padding: 1px 6px;
  border: 1px solid var(--lx-hairline, var(--color-border-1));
  border-radius: 4px;
  background: var(--lx-surface-3, var(--color-fill-2));
  color: var(--lx-text-2, var(--color-text-2));
  font-size: 0.54rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.log-text{
  flex: 1;
  min-width: 0;
  color: var(--lx-text-2, var(--color-text-2));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.log-row:hover .log-text{
  color: var(--lx-text-1, var(--color-text-1));
}
/* 按级别给标签着色：ERROR / WARN 是最需要被扫到的信号 */
.log-row.t-error .log-tag{
  color: var(--lx-danger, rgb(var(--red-6)));
  background: rgba(255, 111, 102, 0.16);
  border-color: rgba(255, 111, 102, 0.38);
  font-weight: 500;
}
.log-row.t-warn .log-tag{
  color: var(--lx-warn, rgb(var(--orange-6)));
  background: rgba(229, 176, 60, 0.16);
  border-color: rgba(229, 176, 60, 0.38);
  font-weight: 500;
}
.log-search{
  width: 148px;
}
.log-clear{
  flex-shrink: 0;
  font-size: 0.6rem;
}
</style>
<template>
  <section class="lx-panel log-bar">
    <header class="lx-panel-head">
      <span class="lx-panel-title">运行日志</span>
      <span class="lx-panel-meta">{{ filteredLogs.length }}</span>
      <div class="lx-panel-extra">
        <a-input-search
          v-model="searchText"
          class="log-search"
          placeholder="搜索日志"
          allow-clear
          size="small"
          @search="handleSearch"
        />
        <a-switch v-model="showAll"  checked-text="全部" unchecked-text="logger" />
        <a-switch
          v-model="autoScroll"
          checked-text="滚动"
          unchecked-text="手动"
          @change="autoScrollChange"
        ></a-switch>
        <a-button class="log-clear" type="text" status="warning" size="mini" @click="handleClear">
          清空
        </a-button>
      </div>
    </header>

    <div class="lx-panel-body log-body">
      <div v-if="filteredLogs.length === 0" class="lx-empty">
        <a-empty description="暂无日志数据" />
      </div>
      <a-scrollbar v-else ref="scrillContentRef" outer-class="h-full" class="h-full" style="overflow-y: auto; overflow-x: hidden;">
        <div ref="logContentRef" class="log-list">
          <div v-for="item of filteredLogs" :key="item.id" class="log-row" :class="`t-${item.type}`">
            <span class="log-time">{{ item.time }}</span>
            <span class="log-tag" :title="item.type">{{ item.type }}</span>
            <span class="log-text" :title="item.data">{{ item.data }}</span>
          </div>
        </div>
      </a-scrollbar>
    </div>
  </section>
</template>
<script setup lang="ts">
import {computed, nextTick, ref, watch } from 'vue';
import { logs } from '@/hooks/log';


const searchText = ref('');
const showAll = ref(true);
const autoScroll = ref(true);
// 只在本地存过值时才覆盖默认值：原来 `getItem(...)=='true'` 在没存过时
// 会把默认的 true 写成 false（首次进来就是"手动"，日志永远停在最旧的几条）
try {
  const savedAutoScroll = localStorage.getItem('autoScroll');
  if (savedAutoScroll !== null) autoScroll.value = savedAutoScroll === 'true';
} catch (error) {
  
}
const autoScrollChange = (value)=>{
  localStorage.setItem('autoScroll', value)
}
// 过滤后的日志
const filteredLogs = computed(() => {
  let result = logs.value;

  // 按关键词搜索
  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase();
    result = result.filter(log => {
      const content = log?.data?.toLowerCase();
      return content.includes(keyword);
    });
  }
  // 只显示 logger 或全部
  if (!showAll.value) {
    result = result.filter(log => log?.type == 'logger');
  }
  return result;
});

// 监听日志变化，自动滚动到底部
watch(
  () => filteredLogs.value.length,
  () => {
    if (autoScroll.value) {
      nextTick(() => {
        scrollToBottom();
      });
    }
  }
);




// 搜索处理
const handleSearch = () => {
  // 搜索已在 computed 中处理
};

// 清空日志
const handleClear = () => {
  logs.value = [];
};

const scrillContentRef = ref();
const logContentRef = ref<HTMLElement>();
// 滚动到底部（最新一条）
// 注意：不能直接用 a-scrollbar 的 scrollTop()。它的滚动上限来自内容尺寸的
// 测量缓存，日志是 100ms 批量到达的，测量还没重算时会被夹回 0 —— 表现为
// "日志明明比可视区多好几倍，却一直停在最旧的几条"。直接写原生容器最稳。
const scrollToBottom = () => {
  if (!logContentRef.value) return;
  const doScroll = () => {
    const container = scrillContentRef.value?.$el?.querySelector?.('.arco-scrollbar-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
      return;
    }
    scrillContentRef.value?.scrollTop?.(logContentRef.value!.scrollHeight);
  };
  nextTick(() => {
    doScroll();
    // 再补一次：等 Scrollbar 重新量过内容高度
    setTimeout(doScroll, 80);
  });
};
</script>
