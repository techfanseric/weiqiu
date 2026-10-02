<template>
  <div class="layout-table">
    <div class="table-header">
      <a-space>
        <!-- <a-input-search v-model="searchForm.name" placeholder="请输入名称" button-text="搜索" allow-clear search-button/> -->
      </a-space>
      <a-space>
        <a-button v-auth="'role.edit'" @click="openAddForm" type="primary">新增</a-button>
      </a-space>
    </div>
    <a-table 
      class="table-content"
      :bordered="{wrapper: true, cell: true}"
      size="medium"
      :columns="columns" 
      :data="tableData"
      :pagination="false"
      :scroll="{
        maxHeight:'100%'
      }"
    >
      <template #handle="{ record, rowIndex }">
        <a-button-group size="small" v-auth="'role.edit'" >
          <a-button type="primary" @click="openEditForm(record)">编辑</a-button>
          <a-button type="primary" @click="handleDelete(record.id)" status="danger">删除</a-button>
        </a-button-group>
      </template>
    </a-table>
    <div class="table-footer">
      <!-- <a-space>
        <a-pagination 
          v-model:page-size="pageForm.size" 
          v-model:current="pageForm.page" 
          :total="pageForm.total"
          @change="handleGetList"
          @page-size-change="handleGetList"
          show-total show-jumper show-page-size/>
      </a-space> -->
    </div>
    <formDrawer ref="formDrawerRef"  @handleGetList="handleGetList" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import api  from '@/api';
import formDrawer from "./components/form-drawer.vue";
import { Message, Modal } from '@arco-design/web-vue';

const searchForm = ref({
  name:''
})

const defaultPage = ()=>{
  return{
    size: 10,
    page : 1,
    total: 6
  }
}
const pageForm = ref(defaultPage())

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '角色标识',
    dataIndex: 'identify',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '操作',
    slotName: 'handle',
    width: 180
  },
];
const tableData = ref<any[]>([]);




onMounted(()=>{
  console.log('onMounted');
  loadData();
})

const loadData = () => {
  console.log('loadData');
  pageForm.value = defaultPage()
  handleGetList()
}

const handleGetList = async() => {
  console.log('handleGetList');
  // let reqData = {
  //   ...searchForm.value,
  //   ...cloneDeep(pageForm.value)
  // }
  // delete reqData.total
  try {
    let res = await api.roles.getList({});
    tableData.value = res?.data || [];
    // pageForm.value.total = res?.data?.total || 0;
  } catch (error) {
    console.log(error)
  }
}



const formDrawerRef = ref()


const openEditForm  = (data)=>{
  formDrawerRef.value.openEdit(data)
}
const openAddForm  = ()=>{
  formDrawerRef.value.openAdd()
}

const handleDelete = (id)=>{
  Modal.warning({
    title: '确认删除',
    content: `是否要删除该角色？`,
    hideCancel: false,
    onOk: async () => {
      try {
        await api.roles.delete({id});
        handleGetList();
        Message.success('删除成功');
      } catch (error) {
        Message.error( error.message ||'删除失败');
        console.log(error);
      }
    },
  });
}

</script>
