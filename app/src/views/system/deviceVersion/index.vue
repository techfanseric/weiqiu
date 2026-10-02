<style lang="less" scoped>
.top-bar{
  padding: 0 1rem;
  height: 3.5rem;
  border-bottom:1px solid var(--color-neutral-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value{
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight:bold;
  font-size: 1.1rem;
  color: var(--color-primary-6);
}
.card-flex{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0.5rem;
  font-size: 0.9rem;
  .flex-value{
    color: var(--color-primary-6);
  }
}
</style>

<template>
  <div style="width: 100%;height: 100%;">
    <a-scrollbar outer-class="h-full" class="h-full" style="overflow-y: scroll;overflow-x: hidden;">
      <a-row :gutter="12" style="width: 100%;margin: 0;">
        <a-col v-for="item in dataList" :span="6" style="margin-bottom:10px">
          <a-card  
            :bordered="false"
            style="width: 100%;height: 12rem;border-radius: 0.5rem;"
            size="small" 
            :body-style="{
              height: 'calc(100% - 40px)',
              padding: '0.5rem'
            }"
          >
            <template #title>
              <div style="width: 100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{ item.name }}</div>
            </template>
            <a-scrollbar outer-class="h-full" class="h-full" style="overflow-y: scroll;overflow-x: hidden;">
              <div v-if="item.children" >
                <div v-for="(item2, index) in item.children" class="card-flex">
                  <div>{{ item2.name }}</div>
                  <div class="flex-value" >{{ item2.value }}</div>
                </div>
              </div>
              <div v-else class="card-value">
                {{ item.value }}
              </div>
            </a-scrollbar>
          </a-card>
        </a-col>
      </a-row>
    </a-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import api from '@/api';




onMounted(async()=>{
  handleGetExperimentList();
})

onUnmounted(()=>{
})


const dataList = ref<any[]>([]);
const handleGetExperimentList = async() => {
  try {
    let res = await api.deviceVersion.get();
    dataList.value = res.data || [];
  } catch (error) {
    console.log(error)
  }
}


</script> 