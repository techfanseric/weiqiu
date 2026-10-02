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
      <a-form-item field="identify" label="角色标识" :disabled="handleType=='edit'" required>
        <a-input v-model="formData.identify" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="name" label="名称" required>
        <a-input v-model="formData.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="permission" label="权限">
        <a-tree :checkable="true" v-model:checked-keys="formData.permission" :data="permissionTree"></a-tree>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script lang="ts" setup>
import { ref, onMounted, PropType } from 'vue';
import api from '@/api';
import { Message } from '@arco-design/web-vue';
import { cloneDeep } from 'lodash';

const props = defineProps({
  roleList: {
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
const openAdd = ()=>{
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
      if(handleType.value=='add'){
        await api.roles.add(formData.value);
      }else{
        await api.roles.edit(formData.value);
      }
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

const permissionTree = ref<any>([])
const  getPermissionTree = ()=>{
  api.permissions.getList({}).then(res=>{
    console.log(res)
    permissionTree.value = res.data;
  })
}

onMounted(()=>{
  getPermissionTree();
})

</script>


