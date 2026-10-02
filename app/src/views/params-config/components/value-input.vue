<style lang="less" >

</style>
<template>
  <a-input :value="inputValue" v-if="valueType=='string'"  />
  <a-input-number :value="inputValue" v-else-if="valueType=='number'"/>
  <a-textarea :value="JSON.stringify(inputValue)" v-else-if="valueType=='object'" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';


const props = defineProps({
  inputValue: {
    type: [String, Number, Array],
    default:""
  }
});
const valueType = computed(() => {
  let type = typeof props.inputValue
  return type;
});

const emit = defineEmits(['update:inputValue', 'change']);

const updateValue = (val)=>{
  if(valueType.value === 'object') val = JSON.parse(val)
  emit('update:inputValue', val);
  emit('change', val);
}

</script>