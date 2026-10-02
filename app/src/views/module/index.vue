<style lang="less" scoped>
/* 模块调试。
   原实现：顶部一条半透明白的「调试模块:」选择条 + a-tabs(card-gutter, large) +
   每个分组里 a-card 网格。card-gutter 的选中 tab 是浅色卡片，在暗色面板上很跳；
   a-card 又是"面板里套卡片"，层级糊在一起。
   现在：选择器收到页头右侧、tabs 改下划线式、卡片自绘（头部 + 参数区 + 执行条）。 */
.mb-page{
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-bar{
  flex-shrink: 0;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
.bar-label{
  font-size: 0.66rem;
  color: var(--lx-text-3, var(--color-text-3));
  white-space: nowrap;
}

.tabs-wrap{
  flex: 1;
  min-height: 0;
}

/* tabs：把 Arco 默认的蓝色下划线 / 灰字换成强调色 + 亮文字。
   注意真实类名是 .arco-tabs-nav / .arco-tabs-nav-ink（不是 header / header-ink） */
.dbg-tabs :deep(.arco-tabs-nav){
  padding: 0 1rem;
}
.dbg-tabs :deep(.arco-tabs-nav::before){
  background-color: var(--lx-hairline, var(--color-border-2));
}
.dbg-tabs :deep(.arco-tabs-nav-ink){
  background: var(--lx-accent, rgb(var(--primary-6)));
}
.dbg-tabs :deep(.arco-tabs-tab){
  padding: 10px 0;
}
.dbg-tabs :deep(.arco-tabs-tab-title){
  font-size: 0.72rem;
  color: var(--lx-text-3, var(--color-text-3));
  transition: color 0.15s ease;
}
.dbg-tabs :deep(.arco-tabs-tab:hover .arco-tabs-tab-title){
  color: var(--lx-text-2, var(--color-text-2));
}
.dbg-tabs :deep(.arco-tabs-tab-active .arco-tabs-tab-title){
  color: var(--lx-text-1, var(--color-text-1));
  font-weight: 500;
}

/* 参数卡片网格 */
.dbg-form{
  height: 100%;
  width: 100%;
  padding: 0.85rem 1rem;
  box-sizing: border-box;
}
.dbg-col{
  margin-bottom: 12px;
}
.dbg-card{
  display: flex;
  flex-direction: column;
  height: 15rem;
  box-sizing: border-box;
  background: var(--lx-surface-2, var(--color-bg-2));
  border: 1px solid var(--lx-hairline, var(--color-border-1));
  border-radius: var(--lx-r-md, 10px);
  overflow: hidden;
  transition: border-color 0.15s ease;
}
.dbg-card:hover{
  border-color: var(--lx-hairline-2, var(--color-border-2));
}
.dbg-card-head{
  flex-shrink: 0;
  height: 2rem;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-bottom: 1px solid var(--lx-hairline, var(--color-border-1));
  color: var(--lx-accent-2, rgb(var(--primary-6)));
}
.dbg-card-name{
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--lx-text-1, var(--color-text-1));
}
.dbg-card-body{
  flex: 1;
  min-height: 0;
}
.dbg-params{
  padding: 0.75rem;
}
.dbg-card-foot{
  flex-shrink: 0;
  height: 2.6rem;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border-top: 1px solid var(--lx-hairline, var(--color-border-1));
}
</style>

<template>
  <div class="layout-table mb-page">
    <!-- 页头：标题 + 调试模块选择 -->
    <div class="page-bar">
      <div class="page-bar-title">
        <span class="page-bar-name">模块调试</span>
        <span class="page-bar-count" v-if="groupsWithChildren.length">{{ groupsWithChildren.length }} 个分组</span>
      </div>
      <div class="page-bar-extra">
        <span class="bar-label">调试模块</span>
        <a-select
          v-model="selectedFlowId"
          style="width: 240px;"
          size="small"
          placeholder="请选择调试模块"
          @change="onFlowChange"
        >
          <a-option v-for="f in flows" :key="f.id" :value="f.id" :label="`${f.alias || f.name || 'flow'}`" />
        </a-select>
      </div>
    </div>

    <div class="tabs-wrap">
      <a-tabs type="line" size="small" class="h-full dbg-tabs">
        <a-tab-pane v-for="(group, index) in groupsWithChildren" :key="group.id" :title="group.name">
          <a-scrollbar outer-class="h-full" class="h-full" style="overflow-y: scroll;overflow-x: hidden;">
            <a-form class="dbg-form" :model="formData" size="small" ref="formRef" auto-label-width>
              <a-row :gutter="12">
                <a-col v-for="item in group.children" :key="item.id" :span="6" class="dbg-col">
                  <div class="dbg-card">
                    <div class="dbg-card-head">
                      <icon-common size="14" />
                      <span class="dbg-card-name" :title="item.blockName">{{ item.blockName }}</span>
                    </div>
                    <div class="dbg-card-body">
                      <a-scrollbar outer-class="h-full" class="h-full" style="overflow-y: scroll;overflow-x: hidden;">
                        <div class="dbg-params">
                          <a-form-item v-for="formRow in item.inParam" :field="`${formRow.name}`" :label="formRow.label" :tooltip="formRow.description" :rules="formRow.FieldRule">
                            <a-select v-if="formRow.field_type=='dropdown'" v-model="formData[formRow.name]" allow-create size="small">
                              <a-option v-for="option in formRow.options" :value="option.value" :label="option.label" />
                            </a-select>
                            <a-textarea v-model="formData[formRow.name]" v-else-if="formRow.field_type=='json'" size="small" />
                            <a-input v-else class="input" v-model="formData[formRow.name]" placeholder="请输入" size="small" />
                          </a-form-item>
                          <div class="lx-empty" v-if="!item.inParam || item.inParam?.length==0">
                            <a-empty description="暂无参数" />
                          </div>
                        </div>
                      </a-scrollbar>
                    </div>
                    <div class="dbg-card-foot">
                      <a-button v-auth="'module.handle'" @click="actionClick(index, item)" long type="primary" size="small">执行模块</a-button>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </a-form>
          </a-scrollbar>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>


<script setup lang="ts" name="module">
import api from '@/api';
import { Message, Notification } from '@arco-design/web-vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { getRules } from '../flow/components/config-drawer/components/rule';
import { MODULE_SOURCE_FLOW_ID } from '@/hooks/flow';
import { mqttMonitor, mqttUnMonitor } from '@/mqtt/monitor';
import { getUniqueId } from '@/utils';


const topic = '/data/notification/changed';

const topicId = getUniqueId();

onMounted(()=>{
  loadData();
  mqttMonitor(topic, topicId, (data)=>{
    try {
      if(data.type=='read'){
        Notification.success({
          title: '读取到值',
          content: JSON.stringify(data?.data),
          duration: 10000,
        })
      }
    } catch (error) {
      
    }
  })
})

onUnmounted(()=>{
  mqttUnMonitor(topic, topicId);
})


const formData = ref({});

const groupsWithChildren = ref<any[]>([]);
const flows = ref<any[]>([]);
const selectedFlowId = ref<number | string>('');
const currentFlowIp = ref<string>('');
const currentSolutionId = ref<number | string>('');

const loadData = async() => {
  try {
    // 获取所有可调试的模块 flow 列表
    const res = await api.flow.getAllFlow();
    flows.value = res?.data || [];

    if (!flows.value.length) {
      Message.error('暂无可调试的模块');
      groupsWithChildren.value = [];
      return;
    }

    // 优先匹配模块库来源 flow（MODULE_SOURCE_FLOW_ID），否则取第一个
    const matched =
      flows.value.find((f: any) => f.id === MODULE_SOURCE_FLOW_ID) ||
      flows.value[0];
    selectedFlowId.value = matched.id;
    buildGroups(matched);
  } catch (error: any) {
    Message.error(error.message || '请求失败！');
    console.log(error);
  }
}

// 根据选中的 flow 构建 debug 分组
const buildGroups = (flow: any) => {
  if (!flow) return;
  currentFlowIp.value = flow.ip;
  currentSolutionId.value = flow.solution_id;
  const flowData = flow?.flow_data?.flowData || [];

  // 查出所有名称带 debug 的 group
  let groups = flowData
    .filter((item) => item?.shape === 'system-group' && item?.data?.blockName?.includes('debug'))
    .sort((a, b) => {
      // 按名称排序
      return (a?.data?.blockName || '').localeCompare(b?.data?.blockName || '');
    }).map((item) => {
      return {
        id: item?.id,
        name: fmtGroupName(item?.data?.blockName || ''),
        children: [] // 初始化子块数组
      };
    });

  groups.forEach((group) => {
    group.children = flowData.filter((item) => {
      // 根据父子关系获取子块
      return item?.parent == group?.id && item?.shape == 'user-start';
    }).map((item) => {
      getRules(item?.data?.inParam || [])
      return {
        id: item?.id,
        ...item?.data,
      };
    });
  });
  groupsWithChildren.value = groups;
}

// 切换调试模块
const onFlowChange = (flowId: number | string) => {
  const flow = flows.value.find((f: any) => f.id === flowId);
  buildGroups(flow);
}

const fmtGroupName = (name) => {
  let list = name.split('_');
  if(list.length > 2){
    return list[2];
  }
  return name.replace('debug', '').trim();
}

const formRef = ref();

const actionClick = (index, item)=>{
  formRef.value?.[index]?.validateField(item.inParam?.map(p=>p.name), (err)=>{
    if(err){
      return;
    }
    let data = {};
    for(let p of item?.inParam||[]){
      data[p.name] = formData.value[p.name];
    }
    async function doFn(){
      api.flow.step({
        flow_id: currentSolutionId.value,
        block_id: item.id,
        param: data,
        ip: currentFlowIp.value
      }).then((res) => {
        Message.success('操作成功');
      }).catch((err)=>{
        Message.error(err.message ?? '操作失败')
      })
    }

    doFn()
  });
  
}

</script>
