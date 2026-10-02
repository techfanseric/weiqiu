<style lang="less" scoped>
.sider-bar{
  height: 100%;
  width: 100%;
  /* Linear v0：侧栏并入 chrome 底色，不再比顶栏更亮抢注意力 */
  background-color: var(--lx-chrome, #232324);
  color: var(--lx-text-1, #FFFFFF);
  border-right: 1px solid var(--lx-hairline, transparent);
  position: relative;
}
.logo-box{
  font-size: 1.05rem;
  height: 3.5rem;
  letter-spacing: 0.18em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--lx-text-1, #FFFFFF);
  user-select: none;
  cursor: pointer;
  img{
    width: 1.8rem;
    height: 1.8rem;
  }
  .logo-text{
    margin-left: 0.5rem;
    white-space: nowrap;
  }
}
.menu-box{
  height: calc(100% - 4rem);
  user-select: none;
}
</style>

<template>
  <div class="sider-bar" >
    <div class="sidebar-brand"><img src="@/assets/brand/siat-logo.png" alt="中国科学院深圳先进技术研究院" /></div>
    <div v-if="!menuCollapsed" class="sidebar-name">微球智能制备<small>LABORATORY CONSOLE</small></div>
    <div class="menu-box">
      <menu-list />
    </div>
    <div v-if="!menuCollapsed" class="sidebar-footer">SIAT · 实验操作台</div>
  </div>
</template>


<script setup lang="ts">
import menuList from "./menu/index.vue";
import { useRouter } from 'vue-router';
import { menuCollapsed } from '@/hooks/setting';
const router = useRouter()



const toHomePage = ()=>{
  router.push({
    name: 'home',
  });
}

</script>