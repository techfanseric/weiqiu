<style lang="less" scoped>
.layout-page{
  width: 100%;
  height: 100%;
}
.layout-header{
  height: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  /* 与 .layout-content 的 1rem 边距对齐，顶栏标题和内容左边缘成一条竖线 */
  padding: 0rem 1rem;
  position: relative;
  /* Linear v0：顶栏用 chrome 底色 + 发丝下边线，去掉向上投影的无效阴影 */
  background-color: var(--lx-chrome, var(--color-bg-2));
  border-bottom: 1px solid var(--lx-hairline, var(--color-border-2));
  box-shadow: none;
}
.tabs-wrapper {
  height: 2.5rem;
  border-bottom: 1px solid var(--color-border-2);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.layout-sider{
  width: 210px !important;
  &.collapsed{
    width: 48px !important;
  }
}
.layout-footer{
  height: 10rem;
}
</style>

<template>
  <div class="layout-page" >
    <a-layout class="h-full w-full">
      <a-layout-sider class="layout-sider" :class="{ collapsed: menuCollapsed}">
        <siderBar/>
      </a-layout-sider>
      <a-layout class="h-full">
        <a-layout-header class="layout-header">
          <topHeader />
        </a-layout-header>
        <!-- <div class="tabs-wrapper">
          <tab-bar />
        </div> -->
        <a-layout-content>
          <div class="layout-content">
            <router-view v-slot="{ Component, route  }">
              <keep-alive :include="['experiment']" >
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>


<script setup lang="ts">
import siderBar from "./sider-bar/index.vue";
import topHeader from "./top-header/index.vue";
import { menuCollapsed } from '@/hooks/setting';
</script>