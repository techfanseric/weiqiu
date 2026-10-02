<style lang="less" scoped>
.top-header{
  /* 强调色在 main.less 全局统一；这里只把边框换成发丝线 */
  --color-border-2: rgba(255, 255, 255, 0.14);
  --color-border-3: rgba(255, 255, 255, 0.2);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
/* 左：当前页面面包屑（父级弱化 / 当前页加重），让顶栏左侧不再空着 */
.header-title{
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 0.8rem;
  white-space: nowrap;
}
.crumb-parent{
  color: var(--lx-text-3, var(--color-text-3));
}
.crumb-sep{
  font-size: 0.7rem;
  color: var(--lx-text-3, var(--color-text-3));
  opacity: 0.45;
}
.crumb-current{
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--lx-text-1, var(--color-text-1));
}
/* 左侧全局运行控制条：初始化 + 实验方案选择 + 运行/暂停/恢复/停止 */
.header-control{
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
.control-label{
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: var(--lx-text-3, var(--color-text-3));
  white-space: nowrap;
}
:deep(.arco-divider-vertical){
  height: 1.1em;
  margin: 0 2px;
  border-color: var(--lx-hairline, var(--color-border-2));
}
</style>

<template>
  <div class="top-header">
    <div class="header-title">
      <template v-if="parentLabel">
        <span class="crumb-parent">{{ parentLabel }}</span>
        <span class="crumb-sep">/</span>
      </template>
      <span class="crumb-current">{{ currentLabel }}</span><span v-if="isPreview" class="preview-notice">演示预览 · 设备指令已禁用</span>
    </div>
    <!-- 初始化 + 实验方案选择 + 运行控制（无 flow.run 权限时整条隐藏，权限与原先首页顶栏一致） -->
    <div v-auth="'flow.run'" class="header-control"><a class="display-link" :href="isPreview ? '#/display?mode=demo' : '#/display'" target="_blank" rel="noopener">展示大屏 ↗</a>
      <a-button size="small" type="outline" :loading="initLoading" :disabled="isPreview" @click="handleInit">
        <template #icon><IconSettings size="14" /></template>
        初始化
      </a-button>
      <a-divider direction="vertical" />
      <span class="control-label">实验方案</span>
      <a-select
        v-model="currentExperiment"
        placeholder="选择实验方案"
        size="small"
        style="width: 220px;"
        allow-clear
      >
        <a-option v-for="item in experimentList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
      </a-select>
      <a-space :size="4">
        <a-button type="primary" size="small" :disabled="isPreview || !currentExperiment" @click="handleAction('run')">
          <template #icon><IconPlayCircle size="14" /></template>
          运行
        </a-button>
        <!-- Linear v0：暂停/恢复改为 outline，让顶栏只保留「强调色 + 状态色」两种语义色 -->
        <a-button type="outline" size="small" :disabled="isPreview || !currentExperiment" @click="handleAction('pause')">
          <template #icon><IconPauseCircle size="14" /></template>
          暂停
        </a-button>
        <a-button type="outline" size="small" :disabled="isPreview || !currentExperiment" @click="handleAction('resume')">
          <template #icon><IconRefresh size="14" /></template>
          恢复
        </a-button>
        <a-button type="primary" status="danger" size="small" :disabled="isPreview || !currentExperiment" @click="handleAction('stop')">
          <template #icon><IconPoweroff size="14" /></template>
          停止
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { currentExperiment } from '@/hooks/main';
import { eflowAction, INIT_FLOW_ID } from '@/hooks/flow';
import api from '@/api';
import { isPreview } from '@/runtime';

// 顶栏面包屑：取路由 matched 上带 meta.label 的层级（如「物料管理 / 试剂管理」）
const route = useRoute();
const crumbs = computed<string[]>(() =>
  route.matched
    .map((item) => item.meta?.label as string)
    .filter((label) => !!label)
);
const parentLabel = computed(() => (crumbs.value.length > 1 ? crumbs.value[crumbs.value.length - 2] : ''));
const currentLabel = computed(() => crumbs.value[crumbs.value.length - 1] || '');

// 实验方案列表
const experimentList = ref<any[]>([]);
const handleGetExperimentList = async () => {
  try {
    const res = await api.experiment.getList();
    experimentList.value = res.data || [];
  } catch (error) {
    console.log(error);
  }
};

// 系统初始化：POST /backend/flow/section { flow_id, name: '系统初始化' }
const initLoading = ref(false);
const handleInit = async () => {
  if (isPreview || initLoading.value) return;
  initLoading.value = true;
  try {
    await api.flow.oneStart({
      flow_id: INIT_FLOW_ID,
      name: '系统初始化',
    });
    Message.success('初始化指令已下发');
  } catch (error: any) {
    Message.error(error?.message ?? '初始化失败');
  } finally {
    initLoading.value = false;
  }
};

const handleAction = (action: string) => {
  if (isPreview || !currentExperiment.value) return;
  try {
    eflowAction(action, { experiment_id: currentExperiment.value });
  } catch (error) {
    // Message.error(error.message || '请求失败！');
  }
};

onMounted(() => {
  handleGetExperimentList();
});
</script>
