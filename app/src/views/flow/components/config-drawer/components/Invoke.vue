<style lang="less">
.border{
  border: 1px solid var(--color-neutral-3);
}
</style>
<template>
  <a-form :model="formData" size="small" ref="formRef" auto-label-width>
    <a-form-item v-for="formRow in formRows" :field="`param.${formRow.name}`" :label="formRow.label" :tooltip="formRow.description" :rules="formRow.FieldRule">
      <a-select v-if="formRow.field_type=='dropdown'" v-model="formData.param[formRow.name]"  allow-create >
        <a-option v-for="option in formRow.options" :value="option.value" :label="option.label" />
      </a-select>
      <!-- <a-textarea v-model="formData.param[formRow.name]" v-else-if="formRow.field_type=='json'" /> -->
      <AceEditor
        v-else-if="formRow.field_type=='json'"
        v-model="formData.param[formRow.name]"
        language="json"
        :read-only="false"
      />
      <a-input v-else class="input" v-model="formData.param[formRow.name]" placeholder="请输入" />
    </a-form-item>
    <a-result v-if="formRows.length==0" status="warning" title="没有参数需要填写">
      <template #icon>
        <IconFaceFrownFill />
      </template>
    </a-result>
  </a-form>
</template>


<script lang="ts" setup>
import { inject, onMounted, PropType, ref } from 'vue';
import { Node } from '@antv/x6';
import { cloneDeep } from 'lodash';
import { IconFaceFrownFill } from '@arco-design/web-vue/es/icon';
import { exposeTriggers } from '@/hooks/flow';
import { getRules } from "./rule";
import AceEditor from '@/components/ace-editor/index.vue';

const props = defineProps({
  node: {
    type: <PropType<Node>>Object,
    default:()=>({})
  }
})

onMounted(()=>{
  const nodeData = props?.node?.getData?.();
  formData.value = {
    blockName: nodeData.blockName,
    invokeId: nodeData.invokeId || '',
    param: cloneDeep(nodeData.param) || {},
  }
  formRef.value.clearValidate();
  invokeIdChange(nodeData.invokeId);
})

const formData = ref<{[propName: string]: any}>({})
const formRule = ref<any>({})



const formRows = ref<any[]>([])
const invokeIdChange = async(value)=>{
  formRows.value = exposeTriggers.value.find((item)=>item.block_id == value)?.inParam || [];
  formRule.value = getRules(formRows.value);

  console.log('formRule', formRule.value);
}

const checkParam  = (key, data)=>{
  if(data[key]===''){
    delete data[key]
  }
}


const saveFlowData:Function = inject('saveFlowData');
const formRef = ref(null);
const saveFormData = async()=>{
  let validErr = await formRef.value.validate();
  if(validErr){
    return false;
  }
  const nodeData = cloneDeep(props?.node?.getData?.());

  nodeData.blockName = formData.value.blockName;
  nodeData.invokeId = formData.value.invokeId;
  for (let key in formData.value.param  || {}) {
    checkParam(key, formData.value.param  || {})
  }
  nodeData.param = formData.value.param;
  props?.node?.setData?.(nodeData, {
    deep: false 
  })
  saveFlowData?.();
  return true;
}


defineExpose({
  saveFormData
})



</script>