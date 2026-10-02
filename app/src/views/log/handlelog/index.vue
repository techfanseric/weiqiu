
<style lang="less" scoped>


</style>
<template>
  <div class="layout-table">
    <div class="table-header">
      <a-space>
        <a-input-search v-model="searchForm.content" @search="handleGetList" placeholder="请输入关键字" button-text="搜索" allow-clear search-button/>
      </a-space>
      <a-space>
        <!-- <a-button type="primary">新增</a-button> -->
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
    ></a-table>
    <div class="table-footer">
      <a-space>
        <a-pagination 
          v-model:page-size="pageForm.size" 
          v-model:current="pageForm.page" 
          :total="pageForm.total"
          @change="handleGetList"
          @page-size-change="handleGetList"
          show-total show-jumper show-page-size/>
      </a-space>
    </div>
  </div>
</template> 
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api  from '@/api';
import { cloneDeep } from 'lodash';

const searchForm = ref({
  content:''
})

const defaultPage = ()=>{
  return{
    size: 20,
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
    title: '内容',
    dataIndex: 'content',
  },
  {
    title: '操作人',
    dataIndex: 'author',
  },
  {
    title: '时间',
    dataIndex: 'created_at',
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
  let reqData = {
    ...searchForm.value,
    ...cloneDeep(pageForm.value)
  }
  delete reqData.total
  try {
    let res = await api.handlelog.getListByPage(reqData);
    tableData.value = res.data?.data || [];
    pageForm.value.total = res.data?.total || 0;
  } catch (error) {
    console.log(error)
  }
}


</script>