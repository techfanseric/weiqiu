<template>
  <div class="layout-table">
    <div class="table-header">
      <a-space>
      </a-space>
      <a-space >
        <a-button @click="fmtDataToJson" type="primary">查看结构</a-button>
        <a-space v-auth="'params-config.edit'" >
          <a-button @click="saveData" type="primary">保存</a-button>
          <a-button @click="exportData" type="primary">导出</a-button>
          <a-button @click="importData" type="primary">导入</a-button>
          <a-button @click="openAddForm()" type="primary">新增节点</a-button>
        </a-space>
      </a-space>
    </div>
    <a-table 
      class="table-content"
      size="medium"
      :bordered="{wrapper: true, cell: true}"
      :columns="columns" 
      :data="(tableData as any)"
      :pagination="false"
      :scroll="{
        maxHeight:'100%'
      }"
      show-empty-tree
      row-key="id"
    >
      <template #value="{ record }">
        <span v-if="record.type=='value'">{{ record.value }}</span>
      </template>
      <template #handle="{ record, rowIndex }">
        <a-button-group size="small" v-auth="'params-config.edit'" >
          <a-tooltip content="复制">
            <a-button type="text" @click="copyStructTo(record.id)" >
              <template #icon>
                <icon-copy />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="record.type=='group'" content="新增子节点">
            <a-button type="text" @click="openAddForm(record.id)" >
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip @click="openEditForm(record)" content="编辑">
            <a-button type="text"  >
              <template #icon>
                <icon-edit />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="删除">
            <a-button type="text" @click="deleteItem(record.id)" >
              <template #icon>
                <icon-delete />
              </template>
            </a-button>
          </a-tooltip>
        </a-button-group>
      </template>
    </a-table>
    <div class="table-footer">
    </div>
    <formDrawer ref="formDrawerRef" :tableData="tableData" @handleGetList="handleGetList" />
    <viewModal ref="viewModalRef" />
  </div>
</template>


<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import formDrawer from "./components/form-drawer.vue";
import viewModal from "./components/view-modal.vue";
import api from '@/api';
import { cloneDeep } from 'lodash';
import { Message, Modal } from '@arco-design/web-vue';
import { copyToClipboard, exportTextAsFile, getUniqueId, importFile, readFileText } from '@/utils';
import { mqttMonitor, mqttUnMonitor } from '@/mqtt/monitor';
import dayjs from 'dayjs';
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '值',
    slotName: 'value',
  },
  {
    title: '操作',
    slotName: 'handle',
    width: 280
  },
];


const tableData = ref([]);


const handleGetList = async() => {
  console.log('handleGetList');
  try {
    let res = await api.paramsConfig.get();
    tableData.value = res?.data || [];
  } catch (error) {
    console.log(error)
  }
}

const formDrawerRef = ref()


const openEditForm  = (data)=>{
  formDrawerRef.value.openEdit(data)
}
const openAddForm  = (id='')=>{
  formDrawerRef.value.openAdd(id)
}

const deleteItem = async (id)=>{
  Modal.warning({
    title: '确认删除',
    content: `是否要删除该数据？`,
    hideCancel: false,
    onOk: async () => {
      try {
        let data = cloneDeep(tableData.value);
        data = deleteItemById(id, data);
        await api.paramsConfig.edit(data);
        handleGetList();
        Message.success('操作成功！')
      } catch (error) {
        Message.error(error.message || '操作失败！')
        console.log(error)
      }
    },
  });
  
}

const deleteItemById = (id, data)=>{
  return data.filter(item=>{
    return item.id !== id
  }).map(item=>{
    if(item.children){
     item.children = deleteItemById(id, item.children)
    }
    return item;
  })
}

const viewModalRef = ref();

const fmtDataToJson = ()=>{
  let data = {};
  tableData.value.forEach(item=>{
    data[item.name] = getItemValue(item);
  })
  console.log(data);
  // alert(JSON.stringify(data, null, 2));

  viewModalRef.value?.open?.(JSON.stringify(data, null, 2));
}

const getItemValue = (item)=>{
  if(item.type === 'group'){
    let data = {};
    item.children.forEach(child=>{
      data[child.name] = getItemValue(child);
    })
    return data;
  }else{
    return item.value
  }
}



const copyStructTo = (id)=>{
  try {
    let data = cloneDeep(tableData.value);
    let names =  `fn.param.${findNames(id, data)}`;
    console.log(names);
    copyToClipboard(names);
    Message.success('复制成功！')
  }catch (error) {
    Message.error(error.message || '复制失败！')
  }
}


const findNames = (id, data)=>{
  for (let i = 0; i < data.length; i++) {
    if(data[i].id === id){
      return data[i].name;
    }else if(data[i].children){
      let res = findNames(id, data[i].children);
      if(res){
        return data[i].name + '.' + res;
      }
    }
  }
}

const topic = '/data/notification/changed';

const topicId = getUniqueId();

onMounted(()=>{
  console.log('onMounted');
  handleGetList();
  mqttMonitor(topic, topicId, (data)=>{
    try {
      if(data.type=='param'){
        handleGetList();
      }
    } catch (error) {
      
    }
  })
})

onUnmounted(()=>{
  mqttUnMonitor(topic, topicId);
})


const  exportData = ()=>{
  let data = {};
  tableData.value.forEach(item=>{
    data[item.name] = getItemValue(item);
  })
  exportTextAsFile(JSON.stringify(data, null, 2), `参数配置-${dayjs().format('YYYY-MM-DD HH-mm-ss')}.json`);
  Message.success('导出成功！')
}

const fmtImpItem = (item, key)=>{
  if(Object.prototype.toString.call(item) == '[object Object]'){
    let children = [];
    for(let key2 in item){
      children.push(fmtImpItem(item[key2], key2))
    }
    return {
      id: getUniqueId(),
      name: key,
      type: 'group',
      children
    }
  }else if(Object.prototype.toString.call(item) == '[object Array]'){
    return {
      id: getUniqueId(),
      name: key,
      type: 'value',
      value: JSON.stringify(item)
    }
  }else{
    return {
      id: getUniqueId(),
      name: key,
      type: 'value',
      value: item
    }
  }
}

const  importData = ()=>{
  importFile('json').then((file) => {
    if(file){
      readFileText(file).then(async(data:string) => {
        try {
          let parseData = JSON.parse(data);
          let newData = [];
          Object.keys(parseData).forEach((key)=>{
            newData.push(fmtImpItem(parseData[key], key))
          })
          await api.paramsConfig.edit(newData);
          tableData.value = newData;
          Message.success('导入成功！')
        } catch (error) {
          console.log(error);
        }
      }).catch(() => {
      })
    }
  }).catch(() => {
  })
}


const saveData = async ()=>{
  try {
    await api.paramsConfig.edit(tableData.value);
    Message.success('保存成功！')
  } catch (error) {
    console.log(error);
    Message.error(error.message || '保存失败！')
  }
}
</script>
