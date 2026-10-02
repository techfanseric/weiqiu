<style lang="less">


</style>
<template>
  <a-drawer
    :width="500" 
    v-model:visible="visible" 
    unmountOnClose 
    @before-ok="handleBeforeOk"
    :title="`设置节点属性(${nodeData?.blockName})`" 
    @cancel="handleCancel" 
    :mask-closable="true"
  >
    <Invoke ref="nodeModalRef" :node="node" v-if="nodeData.type == 'invoke'" />
  </a-drawer>
</template>


<script lang="ts" setup>
import { openSettingModal } from '@/hooks/flow';
import { ref, shallowRef} from 'vue';
import { Node } from '@antv/x6';
import Invoke from "./components/Invoke.vue";

const visible = ref(false);

const node = shallowRef<Node>(null);
const nodeData = ref(null);

const nodeModalRef = ref(null);
openSettingModal.value = (data: Node)=>{
  node.value = data;
  nodeData.value = data.getData();
  visible.value = true;
}

const handleBeforeOk = async()=>{
  return await nodeModalRef.value?.saveFormData()  
}
const handleCancel = ()=>{
}
</script>