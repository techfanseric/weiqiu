<style lang="less">

</style>
<template>
  <svg
    ref="svgRef"
    width="100%"
    height="100%"
  >
    <g>
      <foreignObject 
        v-for="item in task?.barList"
        :key="item.id"
        :x="(svgWidth/totalRange) * item.startTime"
        :y="0"
        :width="(svgWidth/totalRange) * (item.endTime - item.startTime)"
        :height="svgHeight"
        :fill="item.color"
      >
        <a-tooltip >
          <div 
            style="height: 100%;width: 100%;display: flex;align-items: center;justify-content: center;border-radius: 4px;"
            :style="{
              background: item.color,
            }"
          >
            <div style="max-width: 100%;box-sizing: border-box;padding: 0 0.1rem; overflow: hidden;text-overflow: ellipsis;white-space: nowrap;color: #fff;font-size: 12px;">{{ item.label }}</div>
          </div>
          <template #content>
            <div style="display: flex;align-items: center;gap: 0.5rem;">
              <div 
                style="height: 0.8rem;width: 0.8rem;border-radius: 50%;"
                :style="{
                  background: item.color,
                }"
              ></div>
              <div>{{ item.label }}</div>
            </div>
            <div>{{ dayjs(item.startTimestamp).format('YYYY/MM/DD HH:mm:ss') }}-{{ dayjs(item.startTimestamp+item.time*1000).format('YYYY/MM/DD HH:mm:ss') }}</div>
          </template>
        </a-tooltip>
      </foreignObject>
      <!-- <rect  
        v-for="item in task?.barList"
        :key="item.id"
        :x="(svgWidth/totalRange) * item.startTime"
        :y="0"
        :width="(svgWidth/totalRange) * (item.endTime - item.startTime)"
        :height="svgHeight"
        :fill="item.color"
        rx="2" 
        ry="2"
      /> -->
    </g>
  </svg>
</template>


<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, PropType, computed } from 'vue';
import { formatSecondsToHHMMSS, parseTimeToSeconds } from './ganttUtils';
import dayjs from 'dayjs';
const props = defineProps({
  task: {
    type: <PropType<any>>Object,
    default: () => ({barList:[]})
  },
  totalSeconds: {
    type: Number,
    default: 60
  }
});

const svgWidth = ref(0);
const svgHeight = ref(34);
const svgRef = ref(null);


const totalRange = computed(() => props.totalSeconds || 60)


const calcSize = () => {
  if (svgRef.value) {
    svgWidth.value = svgRef.value.clientWidth || 0
  }
}
let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  nextTick(() => {
    calcSize()
    resizeObserver = new ResizeObserver(calcSize);
    if (svgRef.value) {
      resizeObserver.observe(svgRef.value);
    }
  })
})

onUnmounted(() => {
  if (resizeObserver && svgRef.value) {
    resizeObserver.unobserve(svgRef.value);
  }
  resizeObserver = null;
})

// 格式化时间为 HH:MM:SS，支持字符串（如 "00:01:30"）或数字（秒）
function formatTime(v: string | number) {
  if (typeof v === 'string') {
    // 有可能是 "HH:MM:SS" 或数字字符串
    const parsed = parseTimeToSeconds(v);
    return formatSecondsToHHMMSS(Number(parsed) || 0);
  }
  return formatSecondsToHHMMSS(Number(v) || 0);
}
</script>