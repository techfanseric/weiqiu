<style lang="less" scoped>
@import './node.less';
</style>
<template>
  <div class="node-content" :style="{
      backgroundColor: bgColor,
      borderRadius:'20px',
    }">
      <div  class="text">{{ blockName }}</div>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  blockName: {
    type: String,
    default: ''
  },
  bgColor: {
    type: String,
    default: ''
  },
})
</script>