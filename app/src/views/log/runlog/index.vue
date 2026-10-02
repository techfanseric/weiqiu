
<style lang="less" scoped>


</style>
<template>
  <div class="layout-table">
    <div class="table-header">
      <a-space>
        <a-input-search v-model="searchForm.content" placeholder="请输入关键字" button-text="搜索" allow-clear search-button/>
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
    >
    </a-table>
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
    title: '类型',
    dataIndex: 'logType',
  },
  {
    title: '流程名称',
    dataIndex: 'flowName',
  },
  {
    title: '节点名称',
    dataIndex: 'nodeName',
  },
  {
    title: '内容',
    dataIndex: 'logContent',
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
  let reqData = {
    ...searchForm.value,
    page: pageForm.value.page - 1,
    size: pageForm.value.size,
  }
  try {
    let res = await api.runlog.getListByPage(reqData);
    const list = res.data?.data || [];
    tableData.value = list.map((item: any) => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(item.content || '{}');
      } catch (e) {
        parsed = {};
      }
      return {
        ...item,
        logType: parsed.type ?? '',
        flowName: parsed.flow_name ?? '',
        nodeName: parsed.node_name ?? '',
        logContent: parsed.output ?? item.content ?? '',
      };
    });
    pageForm.value.total = res.data?.total || 0;
  } catch (error) {
    console.log(error)
  }
}


</script>