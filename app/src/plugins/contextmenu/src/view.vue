<style lang="less" scoped>
.menu-item{
  display: flex; 
  align-items: center ;
  padding: 0.5rem 0.5rem;
  margin-bottom: 0.25rem 0;
  cursor: pointer;
  &:hover{
    background: rgba(255,255,255,0.08);
  }
}
</style>

<template>
  <Dropdown @popup-visible-change="popupVisibleChange">
    <div ref="contextmenu" style="position: absolute;background: transparent;border-radius: 0.25rem;user-select: none;border: 1px solid rgba(255,255,255,0.2);padding: 0.25rem; font-size: 14px;" :style="{left: `${x}px`, top: `${y}px`}" @click.stop></div>
    <template #content>
      <Dropdown.Option v-for="item in menus" @click="resolve(item)">{{item.label}}</Dropdown.Option>
    </template>
  </Dropdown>
</template>
<script setup lang="ts">
import { ref, reactive, type Ref } from 'vue';
import { Dropdown } from '@arco-design/web-vue';
interface Menu { label: string }

const x = ref(100);
const y = ref(100);
const title = ref('');
const contextmenu: Ref<any> = ref(null);
let menus: Menu[] = reactive([]);
let resolve: Function = ()=> {};
let reject: Function = ()=> {};

// 显示
function show(options: {
  position: {
    x: number, 
    y: number,
  }, 
  menus: Menu[], 
  title?: string 
}) {
  if(options.position) {
    x.value = options.position.x || x.value;
    y.value = options.position.y || y.value;
  }

  menus = options.menus || menus;
  title.value = options.title || title.value;

  setTimeout(adjustPosition);

  return new Promise((fn1, fn2)=> {
    resolve = fn1;
    reject  = fn2;
  });
}

const popupVisibleChange = (visible: boolean) => {
  if(!visible) {
    resolve(null);
  }
}

// 调整位置
function adjustPosition() {
  if(contextmenu.value) {
    let rect = contextmenu.value.getBoundingClientRect();
    let innerWidth  = window.innerWidth;
    let innerHeight = window.innerHeight;
    let targetWidth = rect.width;
    let targetHeight = rect.height;
    let top = rect.top;
    let left = rect.left;
    let right = innerWidth - (left + targetWidth);
    let bottom = innerHeight - (top + targetHeight);

    if(bottom < 0) {
      y.value += (bottom - 10);
    }
    if(right < 0) {
      x.value += (right - 10);
    }
    contextmenu.value.click();
  }
}

(<any>window)['__contextmenuShow'] = show;
</script>