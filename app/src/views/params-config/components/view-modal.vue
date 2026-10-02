<template>
  <a-modal
    v-model:visible="visible" 
    unmountOnClose 
    title="查看结构"
    width="60%"
  >
    <AceEditor
      v-model="dataString"
      :readOnly="true"
      language="json"
      height="500px"
      :showResizeHandle="false"
    />
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AceEditor from '@/components/ace-editor/index.vue';

const visible = ref(false);

const dataString = ref('');

const open = (value:string)=>{
  dataString.value = value
  visible.value = true;
}

defineExpose({ open });
</script>


