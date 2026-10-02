<style lang="less" scoped>
/* 节点容器。
   配色一律走 --lx-*（定义在 :root），不要用 Arco 的 --color-*：
   X6 的 HTML 节点渲染在 <foreignObject> 内，里面有一个 XHTML <body> 元素，
   它会命中 Arco 定义在 body{} 选择器上的 light 主题变量
   （实测 --color-bg-2 解析成 #fff、--color-text-1 解析成 #1D2129），
   于是节点在暗色画布上被渲染成"白色卡片 + 近黑文字"。 */
.node-container{
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: var(--lx-r-sm, 6px);
  color: var(--lx-text-1, #FAFBFC);
  overflow: hidden;
}
</style>
<template>
  <div class="node-container">
    <component :is="node?.shape" :blockName="nodeData?.blockName" :nodeData="nodeData" :bgColor="bgColor" />
  </div>
</template>
<script lang="ts">
export default {
  components: {
    rectangle,
    rectangleNoTopPort
  }
}
</script>
<script lang="ts" setup>
import rectangle from './view/rectangle.vue'
import rectangleNoTopPort from './view/rectangleNoTopPort.vue'
import { computed, onMounted, PropType, ref } from 'vue';
import { Node, Graph } from '@antv/x6';
import { START_NODE_COLOR, triggerColorMap } from '@/hooks/flow';

const props = defineProps({
  node: {
    type: <PropType<Node>>Object,
    default:()=>({})
  },
  graph: {
    type: <PropType<Graph>>Object,
    default:()=>({})
  },
})
const nodeData = ref(props.node.getData());

// 左侧色条颜色：起始节点用固定主色，其余按来源站号取色（同站号同色，与模块库色条对应）
const bgColor = computed(()=>{
  if(nodeData.value?.type=='start'){
    return START_NODE_COLOR
  }
  return triggerColorMap.value[nodeData?.value?.source] || '#7C8FA6'
})

onMounted(()=>{
  props.node.on('change:data', ({ current }) => {
    nodeData.value = current;
  })
})
</script>
