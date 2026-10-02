<style lang="less" scoped>
.z-gabtt{
  height: 100%;
  width: 100%;
  font-size: 12px;
  user-select: none;
}
.scroll-ccc{
  height: calc(100% - 75px); 
  position: relative;
}
// 时间预测栏样式
.prediction-bar{
  background: #F5F5F5;
  height: 35px;
  display: flex;
  overflow: hidden;
  border-bottom: 1px solid #D0D0D0;
  align-items: center;
  .prediction-title{
    height: 100%;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: bold;
  }
  .prediction-content{
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 16px;
    font-size: 11px;
    color: #333;
    .prediction-item{
      margin-right: 24px;
      .label{
        color: #666;
        margin-right: 8px;
      }
      .time{
        color: #2080F0;
        font-weight: 500;
      }
    }
  }
}

.header-bar{
  background: #E0E0E0;
  height: 40px;
  display: flex;
  overflow: hidden;
  .title-row{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .time-bar{
    flex: 1;
    height: 100%;
    background: #E0E0E0;
  }
}
.scroll-item{
  display: flex;
  .item-title{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-right: 1px solid #ccc;
  }
  .taskbar-wraper{
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    padding: 3px 0 ;
  }
}

// 当前时间指针样式
.current-time-pointer{
  position: absolute;
  top: 0;
  z-index: 10;
  pointer-events: none;
  transform: translateX(-50%);
  .pointer-line{
    width: 2px;
    height: 100%;
    background: #ff4444;
    opacity: 0.8;
  }
  
  .pointer-label{
    position: absolute;
    top: 2px;
    left: -30px;
    // width: 60px;
    width: 70px;
    height: 16px;
    background: #ff4444;
    color: white;
    font-size: 10px;
    line-height: 16px;
    text-align: center;
    border-radius: 2px;
    white-space: nowrap;
  }
}
</style>
<template>
  <div class="z-gabtt" >
    <!-- 时间预测栏 -->
    <div class="prediction-bar">
      <div class="prediction-title" >任务总览</div>
      <div class="prediction-content">
        <div class="prediction-item">
          <span class="label">开始时间:</span>
          <span class="time">{{ dayjs(sysStartTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
        </div>
        <div class="prediction-item">
          <span class="label">已耗时:</span>
          <span class="time">{{ predictedDurationLabel }}</span>
        </div>
      </div>
      <a-button  style="display: none;" @click="handleMockData" type="text" size="mini">模拟数据</a-button>
    </div>
    <div class="header-bar">
      <div class="title-row" :style="{width: `${titleWidth}px`}"></div>
      <div class="time-bar">
        <GanttTimeline 
          :startTime="timelineStartSeconds" 
          :endTime="timelineEndSeconds" 
        />
      </div>
    </div>
    <div class="scroll-ccc" ref="contentRef">
      <a-scrollbar v-if="tasks.length>0" outer-class="h-full" class="h-full" style="overflow-y: scroll;overflow-x: hidden;position: relative;">
        <div class="scroll-item" v-for="(item, index) in tasks" 
          :style="{
            height: `${rowHeight}px`,
            background: index%2==0 ? '#F0F0F0':'#E3E3E3',
          }" 
        >
          <div class="item-title" :style="{width: `${titleWidth}px`}">{{ item.label }}</div>
          <div  class="taskbar-wraper">
            <taskbar :task="item" :totalSeconds="totalSeconds" />
          </div>
        </div>
      </a-scrollbar>
      <a-empty v-else description="暂无任务数据" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref, computed,  watch, onMounted, onUnmounted, nextTick } from 'vue';
import GanttTimeline from './GanttTimeline.vue';
import taskbar from './taskbar.vue';
import { formatSecondsToHHMMSS } from './ganttUtils';
const titleWidth = ref(100);
import dayjs from 'dayjs';
import { samplesMock } from '@/views/home/samples'; 
import { sendMqttCmd } from '@/mqtt';
import { isAdmin } from '@/hooks/user';


const handleMockData = ()=>{
  sendMqttCmd('/hitbot/lide/plate/status/', {
    count: 80,
    finshed: 33,
    samples: samplesMock
  })
}


const props = defineProps({
  rowHeight: {
    type: Number,
    default: 40
  },
  // accept tasks from parent
  tasks: {
    type: Array,
    default: () => []
  },
  sysStartTime: {
    type: Number,
    default: 0
  },
  sysEndTime: {
    type: Number,
    default: 0
  },
})


// tasks state: prefer external prop
const tasks = ref<any[]>(props.tasks && props.tasks.length ? props.tasks : [])


// react to parent updates
watch(() => props.tasks, (v) => {
  if (v && v.length) tasks.value = v;
})

// timeline range should start from 00:00:00 and cover task extents
const timelineStartSeconds = computed(() => 0) // 从00:00:00开始
const timelineEndSeconds = computed(() => parseInt(((props.sysEndTime - props.sysStartTime)/1000).toFixed(0))) // 结束时间向上取整到小时


// total seconds for taskbar scaling (range length)
const totalSeconds = computed(() => Math.max(1, timelineEndSeconds.value - timelineStartSeconds.value))


const predictedDurationLabel = computed(() => {
  return formatSecondsToHHMMSS(timelineEndSeconds.value);
})


// 启动时间更新定时器
onMounted(() => {
  nextTick(() => {
    calc()
    resizeObserver = new ResizeObserver(calc);
    if (contentRef.value) {
      resizeObserver.observe(contentRef.value);
    }
  })
})

onUnmounted(() => {
  if (resizeObserver && contentRef.value) {
    resizeObserver.unobserve(contentRef.value);
  }
  resizeObserver = null;
})


const taskbarWidth = ref(0);
const contentRef = ref(null);
const calc = () => {
  if (contentRef.value) taskbarWidth.value = contentRef.value.clientWidth - titleWidth.value;
}

let resizeObserver: ResizeObserver | null = null;



</script>