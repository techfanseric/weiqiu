<template>
  <svg ref="svgRef" :width="width || '100%'" :height="height">
    <g>
      <!-- 主线 -->
      <line :x1="0" :y1="height - 1" :x2="svgWidth" :y2="height - 1" stroke="#333" stroke-width="1" />

      <!-- 刻度 -->
      <template v-for="t in ticks" :key="t">
        <line
          :x1="(svgWidth / totalRange) * t"
          :x2="(svgWidth / totalRange) * t"
          :y1="(t % majorStep === 0) ? height - 20 : height - 10"
          :y2="height"
          stroke="#333"
          :stroke-width="(t % majorStep === 0) ? 2 : 1"
          :opacity="(t % minorStep === 0) ? 1 : 0.6"
        />
        <text
          v-if="t % majorStep === 0"
          :x="(svgWidth / totalRange) * t + 4"
          y="14"
          font-size="12"
          fill="#333"
        >{{ formatLabel(t) }}</text>
      </template>
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { generateTicks, formatSecondsToHHMMSS } from './ganttUtils'

const props = defineProps({
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  width: { type: [Number, String], default: '100%' },
  height: { type: Number, default: 40 },
  maxTicks: { type: Number, default: 12 },
})

const svgRef = ref<SVGSVGElement | null>(null)
const svgWidth = ref(0)

const calc = () => {
  if (svgRef.value) svgWidth.value = svgRef.value.clientWidth || 0
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    calc()
    resizeObserver = new ResizeObserver(calc);
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

const startSeconds = computed(() => props.startTime)
const endSeconds = computed(() => props.endTime)
const totalRange = computed(() => Math.max(1, endSeconds.value - startSeconds.value))

const gen = computed(() => {
  let result = generateTicks(totalRange.value, props.maxTicks)
  return  result
})
const ticks = computed(() => gen.value.ticks || [])
const majorStep = computed(() => gen.value.majorStep || Math.max(1, Math.floor(totalRange.value / props.maxTicks)))
const minorStep = computed(() => gen.value.minorStep || 1)

function formatLabel(seconds: number) {
  // seconds is relative to 0 (start). Show absolute time = start + seconds
  const abs = startSeconds.value + seconds
  return formatSecondsToHHMMSS(abs)
}



</script>

<style scoped>
svg { display: block }
</style>
