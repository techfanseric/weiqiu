<style lang="less" scoped>
/* 流程编辑器骨架：左模块库（14rem 固定）+ 右画布区。
   配色走 --lx-*；地面用 ground、侧栏与画布用 surface-1，形成"画板浮起"的层级。
   原实现是三个 inline style 的 div，顶栏带 0.5rem 左内边距、画布没有边框。 */
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
import { onMounted, provide, ref } from 'vue';
import { hanldeGetTriggers } from '@/hooks/flow';
import { dnd, graph, lineColor, LINE_WIDTH, LINE_DASH } from '@/hooks/flow';
import { createDnd, createFlow } from '@/module-x6/createFlow';
import { bindKeyboard } from '@/module-x6/defaultKeyboard';
import DndTool from './components/dnd-tool.vue';
import TopBar from './components/top-bar.vue';
import api from '@/api';
import ConfigDrawer from "./components/config-drawer/index.vue";
import router from '@/router';
import { Message } from '@arco-design/web-vue';

const experiment_id = ref<number>(Number(router.currentRoute.value.params.id)??1);
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
    let res = await api.flow.getFlowData({experiment_id:experiment_id.value});
    console.log('res', res.data);
    if(res.data?.data){
      graph.value?.fromJSON(res.data.data);
      // 后端存的是历史数据，里面的连线颜色/粗细是旧值（实测画布上出现过高饱和绿、4px 粗虚线），
      // 导入后统一套用当前连线样式。cell:added 在批量 fromJSON 时未必按预期顺序触发，这里兜底。
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
      experiment_id:experiment_id.value,
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
