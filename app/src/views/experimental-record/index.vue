
<style lang="less" scoped>


</style>
<template>
  <div class="layout-table">
    <div class="table-header">
      <a-space>
        <!-- <a-input-search v-model="searchForm.content" @search="handleGetList" placeholder="请输入关键字" button-text="搜索" allow-clear search-button/> -->
      </a-space>
      <a-space>
        <a-button @click="exportData" type="primary">导出</a-button>
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
      <template #progress_data="{ record }">
        {{ JSON.stringify(record.progress_data, null, 2) }}
      </template>
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
import { cloneDeep } from 'lodash';
import * as XLSX from 'xlsx';
const searchForm = ref({
  // content:''
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
    title: 'deep_code',
    dataIndex: 'deep_code',
  },
  {
    title: 'pcr_code',
    dataIndex: 'pcr_code',
  },
  {
    title: '任务数据',
    slotName: 'progress_data',
    ellipsis: true,
    tooltip: true,
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
    let res = await api.esampleProgress.getList(reqData);
    tableData.value = res.data?.data || [];
    pageForm.value.total = res.data?.total || 0;
  } catch (error) {
    console.log(error)
  }
}

const formatExportValue = (value: any) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return value;
};

const exportData = async() => {
  try {
    const res = await api.esampleProgress.getList({
      size: 100000,
      page: 1,
    });
    const rawData = res.data?.data || [];
    if (!rawData.length) {
      return;
    }

    const exportRows = rawData.map((item: any) => ({
      id: item.id,
      deep_code: item.deep_code,
      pcr_code: item.pcr_code,
      progress_data: formatExportValue(item.progress_data),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: ['id', 'deep_code', 'pcr_code', 'progress_data'] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const fileName = `experimental-record-${new Date().toISOString().slice(0, 10)}.xls`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error(error);
  }
};
</script>