

<template>
  <a-menu 
    class="h-full" 
    v-model:collapsed="menuCollapsed"
    :selected-keys="selectedKeys"
  >
    <template v-for="(item, index) in menuList">
      <SubMenu v-if="item.children&&item.children.filter((child)=>!child?.meta?.hideInMenu).length>0" :data="item" :children="item.children"/>
      <MenuItem v-else-if="!item?.meta?.hideInMenu" :data="item" />
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { menuCollapsed } from '@/hooks/setting';
import { menuList } from './menu-list';
import MenuItem from './MenuItem.vue';
import SubMenu from './SubMenu.vue';

import router from '@/router';
import { computed } from 'vue';

const selectedKeys = computed(()=>{
  let list = router.currentRoute.value.matched.map((item)=>item.name as string)
  return list
})
</script>
