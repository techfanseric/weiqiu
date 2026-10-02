<template>
  <a-drawer
    :width="500" 
    v-model:visible="visible" 
    unmountOnClose 
    @before-ok="handleBeforeOk"
    :title="handleType==='add'?'新增':'编辑'" 
    @cancel="handleCancel" 
    :mask-closable="false"
  >
    <a-form ref="formRef" :model="formData" auto-label-width>
      <a-form-item field="name" label="名称" required>
        <a-input v-model="formData.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item v-if="handleType=='add'" field="type" label="类型" required>
        <a-select v-model="formData.type" placeholder="请选择">
          <a-option value="value">值</a-option>
          <a-option value="group">组</a-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="formData.type=='value'" field="value" label="值" required>
        <a-textarea v-model="formData.value" placeholder="请输入" />
        <!-- <AceEditor
          v-model="formData.value"
          language="json"
          :read-only="false"
        /> -->
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script lang="ts" setup>
import { ref, onMounted, PropType } from 'vue';
import api from '@/api';
import { Message } from '@arco-design/web-vue';
import { cloneDeep } from 'lodash';
import { getUniqueId } from '@/utils';
import AceEditor from '@/components/ace-editor/index.vue';
const props = defineProps({
  tableData: {
    type: Array as PropType<any[]>,
    default: ()=>[]
  }
})

const visible = ref(false);
const formData = ref<any>({});
const handleType = ref('edit');

/**
 * 打开编辑抽屉并填充表单数据
 * 
 * @param data - 要编辑的数据对象
 */
const openEdit = (data)=>{
  handleType.value = 'edit';
  visible.value = true;
  formData.value = cloneDeep(data);
}

var fatherId = ref('');

const openAdd = (id = '')=>{
  fatherId.value = id;
  handleType.value = 'add';
  formData.value = {};
  visible.value = true;
}

defineExpose({openEdit, openAdd});
const emit = defineEmits(['handleGetList']);
const formRef = ref()
const handleBeforeOk = async()=>{
  const validErr = await formRef.value.validate();
  if(validErr){
    return false;
  }else{
    try {
      if(!checkVarName()){
        return false;
      }
      let data = cloneDeep(props.tableData);
      if(handleType.value=='add'){
        if(formData.value.type=='group'){
          delete formData.value.value
          formData.value.children = []
        }else{
          delete formData.value.children;
        }
        formData.value.id = getUniqueId();
        if(!fatherId.value){
          data.push(formData.value);
        }else{
          let item = getItemById(fatherId.value, data)
          item.children.push(formData.value)
        }
      }else{
        let item = getItemById(formData.value.id, data)
        item.name = formData.value.name;
        item.value = formData.value.value;
      }
      await api.paramsConfig.edit(data);
      emit('handleGetList');
      Message.success('操作成功！')
      return true;
    } catch (error) {
      Message.error(error.message || '操作失败！')
      console.log(error)
      return false;
    }
  }
}
const handleCancel = ()=>{
  formRef.value.resetFields();
  formData.value = {};
}

onMounted(()=>{
})



const getItemById = (id, data)=>{
  for(let i=0;i<data.length;i++){
    if(data[i].id==id) return data[i]
    else if(data[i].children && data[i].children.length>0) {
      const res = getItemById(id, data[i].children)
      if(res) return res
    }
  }
}


const checkVarName = ()=>{

  // if(!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)){
  //   Message.warning('名称不合法');
  //   return false
  // }

  //检验不允许数字开头
  if(/^[0-9]/.test(formData.value.name)){
    Message.warning('名称不允许以数字开头');
    return false
  }
  return true
}

</script>


