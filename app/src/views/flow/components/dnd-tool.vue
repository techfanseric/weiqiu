<style lang="less" scoped>
/* 模块库侧栏（流程编辑器左侧）。全部自绘，配色走 --lx-*（不用 Arco 的 --color-*，
   原因见 components/node/index.vue 顶部说明；这里虽然不在 foreignObject 里，
   但统一走一套 token 更省心）。
   原实现：外层 bg-1 + 无效的向上阴影，头部是 #464243 土棕，列表项是 fill-2 横条。 */
.lib{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--lx-surface-1, #1F2229);
  border-right: 1px solid var(--lx-hairline, rgba(255, 255, 255, 0.10));
  overflow: hidden;
}
.lib-head{
  flex-shrink: 0;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border-bottom: 1px solid var(--lx-hairline, rgba(255, 255, 255, 0.10));
  color: var(--lx-text-2, #C0C7D2);
}
.lib-title{
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  color: var(--lx-text-2, #C0C7D2);
  white-space: nowrap;
}
.lib-count{
  margin-left: auto;
  font-family: var(--lx-mono, monospace);
  font-size: 0.6rem;
  color: var(--lx-text-3, #949CAA);
}
.lib-body{
  flex: 1;
  min-height: 0;
  padding: 8px;
}
/* 列表项：左侧 3px 色条 = 来源站号（与画布节点上的色条同一套取色） */
.tool-item{
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.2rem;
  margin-bottom: 4px;
  padding: 0 8px;
  background: var(--lx-surface-2, #272A32);
  border: 1px solid var(--lx-hairline, rgba(255, 255, 255, 0.10));
  border-left: 3px solid var(--tool-accent, #6E7AE4);
  border-radius: var(--lx-r-sm, 6px);
  cursor: move;
  font-size: 0.78rem;
  color: var(--lx-text-2, #C0C7D2);
  user-select: none;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  &:hover{
    background: var(--lx-surface-3, #32363F);
    color: var(--lx-text-1, #FAFBFC);
    border-color: var(--lx-hairline-2, rgba(255, 255, 255, 0.16));
    border-left-color: var(--tool-accent, #6E7AE4);
  }
  .tool-name{
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tool-source{
    flex-shrink: 0;
    max-width: 4.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--lx-mono, monospace);
    font-size: 0.6rem;
    color: var(--lx-text-3, #949CAA);
    padding: 0 5px;
    border-radius: 3px;
    background: var(--lx-surface-3, #32363F);
  }
}
</style>
<template>
  <div class="lib">
    <div class="lib-head">
      <icon-branch :size="15" />
      <span class="lib-title">模块库</span>
      <span class="lib-count">{{ nodes.length }}</span>
    </div>
    <div class="lib-body">
      <a-scrollbar outer-class="h-full" class="h-full" style="overflow-y: auto; overflow-x: hidden;">
        <div
          @mousedown="(e) => startDrag(e, item)"
          :style="{ '--tool-accent': triggerColorMap[item?.data?.source] || '#7C8FA6' }"
          v-for="(item, index) in nodes"
          :key="index"
          class="tool-item"
        >
          <icon-common :size="15" />
          <div class="tool-name">{{ item?.data?.blockName }}</div>
          <span v-if="item?.data?.source" class="tool-source">{{ item?.data?.source }}</span>
        </div>
      </a-scrollbar>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { dnd, graph, triggerColorMap } from '@/hooks/flow';
import { exposeTriggers } from '@/hooks/flow';
import { cloneDeep } from 'lodash';
import { computed } from 'vue';


const startDrag = (e: MouseEvent, nodeData: any) => {
  // 创建一个节点
  let tmpData = cloneDeep(nodeData);
  const node = graph.value.createNode(tmpData);
  dnd.value.start(node, e);
};


const nodes = computed(() => {
  let others = exposeTriggers.value.map((item) => {
    let param = {};
    for(let p of item.inParam || []){
      param[p.name] = p.value || '';
    }
    return {
      shape: "rectangle",
      data:{
        type: 'invoke',
        invokeId: item.block_id || '',
        blockName: item.blockName,
        source: item.source || '',
        param: {
          ...param
        }
      }
    };
  });
  return [{
    shape: "rectangleNoTopPort",
    data:{
      type: 'start',
      blockName: '开始',
      source: '',
      data:{}
    },
  },...others];
});

</script>
