<style lang="less" scoped>
/* 实验流程列表。
   原实现：a-card 网格（每张固定 15rem 高，但卡体只有一行描述 → 大片空白），
   且"面板里套卡片"两层底色接近，层级很弱。
   现在改成自绘流程卡片：名称 + 描述（2 行截断）+ 底部操作条，高度压到 7.4rem
   （够放「标题 + 两行描述 + 操作条」，不留空白），一屏能放四行；卡片 hover 时描边提亮、底色微抬，边界清楚但不刺眼。 */
.ex-page{
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 页头：左侧标题 + 计数，右侧操作 */
.page-bar{
  flex-shrink: 0;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid var(--lx-hairline, var(--color-border-2));
}
.page-bar-title{
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.page-bar-name{
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--lx-text-1, var(--color-text-1));
  white-space: nowrap;
}
.page-bar-count{
  font-family: var(--lx-mono, monospace);
  font-size: 0.6rem;
  color: var(--lx-text-3, var(--color-text-3));
}
.page-bar-extra{
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ex-content{
  flex: 1;
  min-height: 0;
  position: relative;
}
.grid-wrap{
  padding: 1rem;
}
.grid-col{
  margin-bottom: 12px;
}

/* ---- 流程卡片 ---- */
.flow-card{
  display: flex;
  flex-direction: column;
  height: 7.4rem;
  box-sizing: border-box;
  background: var(--lx-surface-2, var(--color-bg-2));
  border: 1px solid var(--lx-hairline, var(--color-border-1));
  border-radius: var(--lx-r-md, 10px);
  overflow: hidden;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.flow-card:hover{
  background: var(--lx-surface-3, var(--color-fill-2));
  border-color: var(--lx-hairline-2, var(--color-border-2));
}
.flow-card-head{
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 8px 0 12px;
  color: var(--lx-accent-2, rgb(var(--primary-6)));
}
.flow-card-name{
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--lx-text-1, var(--color-text-1));
}
.flow-card-tools{
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.flow-card:hover .flow-card-tools{
  opacity: 1;
}
.flow-card-desc{
  flex: 1;
  min-height: 0;
  padding: 4px 12px 6px;
  font-size: 0.66rem;
  line-height: 1.5;
  color: var(--lx-text-3, var(--color-text-3));
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.flow-card-foot{
  flex-shrink: 0;
  height: 2.1rem;
  display: flex;
  align-items: center;
  padding: 0 8px 0 6px;
  border-top: 1px solid var(--lx-hairline, var(--color-border-1));
}
.flow-card-run{
  display: flex;
  align-items: center;
  gap: 2px;
}
.flow-card-more{
  margin-left: auto;
}
</style>
<template>
  <div class="layout-table ex-page">
    <div class="page-bar">
      <div class="page-bar-title">
        <span class="page-bar-name">{{ isShowFlow ? '流程画布' : '实验流程' }}</span>
        <span class="page-bar-count" v-if="!isShowFlow">{{ listData.length }} 个</span>
      </div>
      <div class="page-bar-extra">
        <a-button v-if="isShowFlow" @click="handleBack" type="outline" size="small">
          <template #icon><icon-left size="15" /></template>
          返回列表
        </a-button>
        <template v-else>
          <a-button @click="handleRefresh" type="outline" size="small">
            <template #icon><icon-refresh size="15" /></template>
            刷新
          </a-button>
          <a-button v-auth="'flow.edit'" @click="openAddForm" type="primary" size="small">
            <template #icon><icon-plus size="15" /></template>
            新增
          </a-button>
        </template>
      </div>
    </div>
    <div class="ex-content">
      <a-scrollbar v-if="listData.length>0" outer-class="h-full" class="h-full" style="overflow-y: scroll;overflow-x: hidden;">
        <div class="grid-wrap">
          <a-row :gutter="12">
            <a-col v-for="item in listData" :key="item.id" :span="6" class="grid-col">
              <div class="flow-card">
                <div class="flow-card-head">
                  <icon-branch size="15" />
                  <span class="flow-card-name" :title="item.name">{{ item.name }}</span>
                  <div class="flow-card-tools" v-auth="'flow.edit'">
                    <a-button class="lx-icon-btn" title="编辑" type="text" size="mini" @click="openEditForm(item)">
                      <template #icon><icon-edit size="14" /></template>
                    </a-button>
                    <a-button class="lx-icon-btn" title="删除" type="text" size="mini" status="danger" @click="handleDelete(item.id)">
                      <template #icon><icon-delete size="14" /></template>
                    </a-button>
                  </div>
                </div>
                <div class="flow-card-desc">{{ item.description || '暂无描述' }}</div>
                <div class="flow-card-foot">
                  <div class="flow-card-run" v-auth="'flow.run'">
                    <a-button class="lx-icon-btn" title="运行" type="text" size="mini" @click="handleAction('run', item.id)">
                      <template #icon><IconPlayCircle size="14" /></template>
                    </a-button>
                    <a-button class="lx-icon-btn" title="暂停" type="text" size="mini" @click="handleAction('pause', item.id)">
                      <template #icon><IconPauseCircle size="14" /></template>
                    </a-button>
                    <a-button class="lx-icon-btn" title="恢复" type="text" size="mini" @click="handleAction('resume', item.id)">
                      <template #icon><IconRefresh size="14" /></template>
                    </a-button>
                    <a-button class="lx-icon-btn" title="停止" type="text" size="mini" @click="handleAction('stop', item.id)">
                      <template #icon><IconPoweroff size="14" /></template>
                    </a-button>
                  </div>
                  <a-button class="flow-card-more" type="text" size="small" @click="openFlow(item.id)">
                    查看流程
                  </a-button>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-scrollbar>
      <div v-else class="h-full flex items-center justify-center">
        <a-empty description="暂无数据" />
      </div>
      <div v-if="isShowFlow" style="position: absolute;left: 0;top: 0;right: 0;bottom: 0;">
        <Flow :experiment_id="currentFlowId"  />
      </div>
    </div>
    <formDrawer ref="formDrawerRef"  @handleGetList="handleGetList" />
  </div>
</template>
<script setup lang="ts" name="experiment" >
import { onMounted, ref } from 'vue';
import api  from '@/api';
import formDrawer from "./components/form-drawer.vue";
import { Message, Modal } from '@arco-design/web-vue';
import { eflowAction } from '@/hooks/flow';
import { IconPlayCircle, IconPauseCircle, IconRefresh, IconPoweroff } from '@arco-design/web-vue/es/icon';
defineOptions({ name: 'experiment' });     // Vue 3.3+
import Flow from '../flow/component.vue'

const listData = ref<any>([]);


onMounted(()=>{
  console.log('onMounted');
  loadData();
})

const loadData = () => {
  console.log('loadData');
  handleGetList()
}


const handleGetList = async() => {
  try {
    let res = await api.experiment.getList();
    listData.value = res.data || [];
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
    content: `是否要删除该实验？`,
    hideCancel: false,
    onOk: async () => {
      try {
        await api.experiment.delete({id});
        handleGetList();
        Message.success('删除成功');
      } catch (error) {
        Message.error( error.message ||'删除失败');
        console.log(error);
      }
    },
  });
}

const handleAction = (action: string, id)=>{
  try {
    eflowAction(action, {experiment_id: id})
  } catch (error) {
    // Message.error(error.message || '请求失败！');
  }
}

const isShowFlow = ref(false);
const currentFlowId = ref();
const openFlow = (id)=>{
  isShowFlow.value = true;
  currentFlowId.value = id;
}

const handleBack = ()=>{
  isShowFlow.value = false;
}

const handleRefresh = ()=>{
  loadData();
}

</script>
