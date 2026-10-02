

<template>
  <a-menu-item @click="goto" :key="data.name">
    <template v-if="iconEl" #icon>
      <iconEl />
    </template>
    {{ data?.meta?.label }}
  </a-menu-item>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  data:{
    type: Object,
    default: ()=>({})
  }
})

var iconEl:any = null
if(props.data?.meta?.icon){
  const iconComponent = resolveComponent(props.data.meta.icon);
  iconEl = () => iconComponent ? h(iconComponent, { size: 16 }) : null;
}

const router = useRouter();
const goto = () => {
  router.push({
    name: props.data.name,
  });
};
</script>