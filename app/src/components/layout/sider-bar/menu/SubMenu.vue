



<template>
  <a-sub-menu :key="data.name">
    <template v-if="iconEl"  #icon>
      <iconEl />
    </template>
    <template #title>
      {{ data?.meta?.label }}
    </template>
    <template v-for="(item, index) in children">
      <SubMenu v-if="item.children&&item.children.filter((child)=>!child?.meta?.hideInMenu).length>0" :data="item" :children="item.children" />
      <MenuItem v-else-if="!item?.meta?.hideInMenu" :data="item" />
    </template>
  </a-sub-menu>
</template>

<script setup lang="ts">
import { h, resolveComponent, PropType } from 'vue';
import MenuItem from './MenuItem.vue';
import { RouteRecordRaw } from 'vue-router';
const props = defineProps({
  data:{
    type: <PropType<RouteRecordRaw>>Object,
    default: ()=>({})
  },
  children:{
    type: <PropType<RouteRecordRaw[]>>Array,
    default: ()=>([])
  }
})

var iconEl:any = null
if(props.data?.meta?.icon){
  const iconComponent = resolveComponent(props.data.meta.icon as string);
  iconEl = () => iconComponent ? h(iconComponent, { size: 16  }) : null;
}

</script>