<style lang="less" scoped>
/* 流程编辑器骨架（内嵌版，供「实验流程」列表页打开流程时使用）。
   与 views/flow/index.vue 保持同一套样式，差别只是 experiment_id 来自 props。 */
.layout-cc{
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  background: var(--lx-ground, var(--color-bg-1));
}

.flow-side{
  height: 100%;
  width: 14rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.flow-main{
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 8px 8px 0;
  box-sizing: border-box;
}
.flow-main-bar{
  flex-shrink: 0;
}
.flow-canvas{
  flex: 1;
  min-height: 0;
  border: 1px solid var(--lx-hairline, var(--color-border-2));
  border-radius: var(--lx-r-sm, 6px);
  overflow: hidden;
}
</style>
<template>
  <div class="layout-cc">
    <div class="flow-side">
      <DndTool />
    </div>
    <div class="flow-main">
      <div class="flow-main-bar">
        <TopBar @save-flow-data="saveFlowData" :experiment_id="experiment_id" />
      </div>
      <div id="graph-container" class="flow-canvas"></div>
    </div>
    <ConfigDrawer />
  </div>
</template>


<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { hanldeGetTriggers } from '@/hooks/flow';
import { dnd, graph, lineColor, LINE_WIDTH, LINE_DASH } from '@/hooks/flow';
import { createDnd, createFlow } from '@/module-x6/createFlow';
import { bindKeyboard } from '@/module-x6/defaultKeyboard';
import DndTool from './components/dnd-tool.vue';
import TopBar from './components/top-bar.vue';
import api from '@/api';
import ConfigDrawer from "./components/config-drawer/index.vue";
import { Message } from '@arco-design/web-vue';

const props = defineProps({
  experiment_id: {
    type: Number,
    default: 1,
  }
})
const initWorkspace = ()=>{
  graph.value = createFlow();
  dnd.value = createDnd(graph.value);
  bindKeyboard(graph.value);
}
onMounted( async()=>{
  console.log('onMounted');
  initWorkspace();
  hanldeGetTriggers();
  getFlowData();
})



const getFlowData = async()=>{
  try {
    let res = await api.flow.getFlowData({experiment_id:props.experiment_id});
    console.log('res', res.data);
    if(res.data?.data){
      graph.value?.fromJSON(res.data.data);
      // 同 views/flow/index.vue：历史数据里的连线样式统一套用当前值
      graph.value?.getEdges().forEach((edge) => {
        edge.attr({
          line: {
            stroke: lineColor.value,
            strokeWidth: LINE_WIDTH,
            strokeDasharray: LINE_DASH,
          },
        });
      });
    }
  } catch (error) {
    console.log(error)
  }
}


const saveFlowData = async()=>{
  graph.value?.cleanSelection();
  let data = graph.value?.toJSON();
  console.log('data', data);
  try {
    let res = await api.flow.editFlowData({
      experiment_id: props.experiment_id,
      data: data,
    });
    console.log('res', res);
    Message.success("保存成功");
  } catch (error) {
    console.log(error)
  }
}
provide('saveFlowData', saveFlowData);
</script>
