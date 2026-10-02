<style lang="less" scoped>
/* 流程节点（标准块）。
   配色走 --lx-*，不要用 Arco 的 --color-* —— 原因见 components/node/index.vue 顶部说明
   （X6 的 foreignObject 里有个 XHTML <body>，会命中 Arco 定义在 body{} 上的 light 主题变量）。
   视觉：中性面板底 + 发丝描边 + 左侧 3px 色条做「来源站号」标识，
   不再整块铺高饱和底色（原实现把 ECharts 色板整块铺在节点头上，和整体克制配色打架）。 */
.node-wrapper{
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  border-radius: var(--lx-r-sm, 6px);
  background: var(--lx-surface-1, #1F2229);
  color: var(--lx-text-1, #FAFBFC);
  border: 1px solid var(--lx-hairline, rgba(255, 255, 255, 0.10));
  border-left: 3px solid var(--node-accent, #6E7AE4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.node-wrapper:hover{
  background: var(--lx-surface-2, #272A32);
  border-color: var(--lx-hairline-2, rgba(255, 255, 255, 0.16));
  border-left-color: var(--node-accent, #6E7AE4);
}
.node-header{
  display: flex;
  align-items: center;
  gap: 0.3rem;
  height: 26px;
  flex-shrink: 0;
  padding: 0 8px;
  overflow: hidden;
  border-bottom: 1px solid var(--lx-hairline, rgba(255, 255, 255, 0.10));
  font-size: 12px;
  font-weight: 500;
  color: var(--lx-text-1, #FAFBFC);
}
.node-title{
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-cc{
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  padding: 4px 8px;
  font-family: var(--lx-mono, monospace);
  font-size: 10px;
  line-height: 13px;
  color: var(--lx-text-3, #949CAA);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
<template>
  <div class="node-wrapper" :style="{ '--node-accent': bgColor }">
    <div class="node-header">
      <icon-common :size="14" />
      <div class="node-title">{{ nodeData?.blockName }}</div>
    </div>
    <div class="node-cc">{{ extData }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { IconCommon } from '@arco-design/web-vue/es/icon';
import { exposeTriggers } from '@/hooks/flow';

const props = defineProps({
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

// 参数预览：能查到模块定义时按 label 展示，否则直接落 JSON
// （与「模块调试」页读的是同一份 exposeTriggers，保证两处显示一致）
const extData = computed(()=>{
  let nullData = '无参数';
  if(Object.keys(props.nodeData.param??{}).length == 0){
    return nullData;
  }
  let formRows = exposeTriggers.value.find((item)=>item.block_id == props.nodeData?.invokeId)?.inParam || [];
  if(formRows?.length==0){
    return JSON.stringify(props.nodeData?.param??{}, null, 2);
  }
  let data = {};
  formRows.forEach((item)=>{
    data[item.label] = props.nodeData?.param?.[item.name] ?? '';
  })
  return JSON.stringify(data, null, 2);
})

</script>
