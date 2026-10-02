<style lang="less" scoped>
/* 起始节点（比标准块矮，120×36）：胶囊形态，图标 + 名称。
   配色同样走 --lx-*，不要用 Arco 的 --color-* —— 见 components/node/index.vue 顶部说明。 */
.node-wrapper{
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 10px;
  border-radius: var(--lx-r-sm, 6px);
  background: var(--lx-surface-2, #272A32);
  color: var(--lx-text-1, #FAFBFC);
  border: 1px solid var(--lx-hairline-2, rgba(255, 255, 255, 0.16));
  border-left: 3px solid var(--node-accent, #6E7AE4);
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  overflow: hidden;
}
.node-title{
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
<template>
  <div class="node-wrapper" :style="{ '--node-accent': bgColor }">
    <icon-play-circle :size="14" />
    <div class="node-title">{{ blockName }}</div>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from 'vue';
import { IconPlayCircle } from '@arco-design/web-vue/es/icon';

defineProps({
  nodeData: {
    type: <PropType<any>>Object,
    default:()=>({})
  },
  blockName: {
    type: String,
    default: ''
  },
  bgColor: {
    type: String,
    default: ''
  },
})
</script>
