<style lang="less" scoped>
/* 流程编辑器顶部工具条。
   原实现是一个 40px 的 a-card 只放了一个图标按钮（外层还带 a-card 的白底/内边距，
   在深色画布上很违和）。改成自绘细条：左侧标题 + 操作提示，右侧主操作。 */
.flow-bar{
  flex-shrink: 0;
  height: 46px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  box-sizing: border-box;
  background: var(--lx-surface-1, #1F2229);
  border: 1px solid var(--lx-hairline, rgba(255, 255, 255, 0.10));
  border-radius: var(--lx-r-sm, 6px);
  color: var(--lx-text-2, #C0C7D2);
}
.flow-bar-title{
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--lx-text-1, #FAFBFC);
  white-space: nowrap;
}
.flow-bar-hint{
  font-size: 0.62rem;
  color: var(--lx-text-3, #949CAA);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.flow-bar-extra{
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
<template>
  <div class="flow-bar">
    <icon-branch :size="15" />
    <span class="flow-bar-title">流程画布</span>
    <span class="flow-bar-hint">从左侧模块库拖入节点，连线完成编排</span>
    <div class="flow-bar-extra">
      <a-button v-auth="'flow.edit'" @click="saveFlowData" type="primary" size="small">
        <template #icon>
          <IconSave size="15" />
        </template>
        保存
      </a-button>
    </div>
  </div>
</template>



<script lang="ts" setup>
import { eflowAction } from '@/hooks/flow';
import { IconSave } from '@arco-design/web-vue/es/icon';

const props = defineProps({
  experiment_id:{
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['saveFlowData']);

const saveFlowData = ()=>{
  emit('saveFlowData');
}


const handleAction = (action: string)=>{
  try {
    eflowAction(action, {experiment_id: props.experiment_id})
  } catch (error) {
    // Message.error(error.message || '请求失败！');
  }
}

</script>
