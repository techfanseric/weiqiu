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
      <a-form-item field="username" label="账号" :disabled="handleType=='edit'" required>
        <a-input v-model="formData.username" placeholder="请输入" />
      </a-form-item>
      <!-- v-if="handleType==='add'" -->
      <a-form-item  field="password" label="初始密码" required>
        <a-input v-model="formData.password" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="alias" label="名称" required>
        <a-input v-model="formData.alias" placeholder="请输入" />
      </a-form-item>
      <!-- <a-form-item field="email" label="邮箱" required>
        <a-input v-model="formData.email" placeholder="请输入" />
      </a-form-item> -->
      <a-form-item field="role_id" label="角色" required>
        <a-select v-model="formData.role_id"  placeholder="请选择">
          <a-option v-for="item of roleList" :value="item.id" :label="item.name" />
        </a-select>
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
  formData.value = {
    pwd: '123456'
  };
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
      delete formData.value.permission;
      if(handleType.value=='add'){
        await api.user.add(formData.value);
      }else{
        await api.user.edit(formData.value);
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

onMounted(()=>{
})

</script>


