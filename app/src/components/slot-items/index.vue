<template>
  <svg :viewBox="viewBox" :style="svgStyle">
    <g v-for="(pos, i) in cellHoles" :key="pos">
      <rect
        class="slot-cell"
        :class="{ 'is-filled': isFilled(pos.index) }"
        :x="pos.x"
        :y="pos.y"
        :width="cellRealWidth"
        :height="cellRealHeight"
        rx="8"
        vector-effect="non-scaling-stroke"
        @click="toggleItemClick(pos.index)"
      />
      <text
        class="slot-index"
        :class="{ 'is-filled': isFilled(pos.index) }"
        :x="pos.x + 10"
        :y="pos.y + 10"
        text-anchor="middle"
        alignment-baseline="central"
        :font-size="fontSize"
      >
        {{ pos.displayIndex }}
      </text>
      <text
        v-if="hasContent(pos.index)"
        class="slot-text"
        :x="pos.x + cellRealWidth/2"
        :y="pos.y + cellRealHeight/2 - (subText(pos.index) ? 5 : 0)"
        text-anchor="middle"
        alignment-baseline="central"
        font-size="6"
      >
        {{ mainText(pos.index) }}
      </text>
      <text
        v-if="hasContent(pos.index) && subText(pos.index)"
        class="slot-sub"
        :x="pos.x + cellRealWidth/2"
        :y="pos.y + cellRealHeight/2 + 5"
        text-anchor="middle"
        alignment-baseline="central"
        font-size="5"
      >
        {{ subText(pos.index) }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
  data: {
    type: Object,
    default: ()=>({})
  },
  horizontal: {
    type: Number,
    default: 4
  },
  vertical: {
    type: Number,
    default: 2
  },
  cellWidth: {
    type: Number,
    default: 80
  },
  cellHeight: {
    type: Number,
    default: 100
  },
  sizeRatio: {
    type: Number,
    default: 0.8
  },
  startIndex: {
    type: Number,
    default: 1
  },
  fontSize: {
    type: Number,
    // 用户单位字号：SVG 按容器等比缩放，格子在 1080p 下通常被放大 1.8~2.2 倍，
    // 因此这里的 6 单位实际渲染约 11~13px（序号是弱化的角标，不该抢主体）
    default: 6
  },
  // 格子主文本字段（默认旧契约「类型」）
  textField: {
    type: String,
    default: '类型'
  },
  // 格子第二行小字备注字段（空则不显示第二行）
  remarkField: {
    type: String,
    default: ''
  },
  // 是否从下到上排布（true: 第 1 个在左下，逐行向上；false: 从左上逐行向下）
  reverseY: {
    type: Boolean,
    default: true
  },
  // 格子整体缩放上限（px，0 = 不限制）：
  // SVG 是 width/height 100% 的替换元素，容器越大格子被放得越大；
  // 这两项给「内容框」一个上限，避免稀疏区域（如每列仅 4 格）把格子撑成大色块。
  maxWidth: {
    type: Number,
    default: 0
  },
  maxHeight: {
    type: Number,
    default: 0
  }
});

const svgStyle = computed(() => {
  const style: Record<string, string> = { width: '100%', height: '100%' };
  if (props.maxWidth) style.maxWidth = `${props.maxWidth}px`;
  if (props.maxHeight) style.maxHeight = `${props.maxHeight}px`;
  return style;
});

const layoutWidth = computed(() => {
  return props.horizontal * props.cellWidth;
})
const layoutHeight = computed(() => {
  return props.vertical * props.cellHeight;
})
const viewBox = computed(() => {
  return `0 0 ${layoutWidth.value} ${layoutHeight.value}`
})

const cellRealWidth = computed(() => {
  return props.cellWidth * props.sizeRatio;
})

const cellRealHeight = computed(() => {
  return props.cellHeight * props.sizeRatio;
})

const cellHoles = computed(() => {
  let holes = []
  for (let i = 0; i < props.horizontal * props.vertical; i++) {
    let idx = i + props.startIndex;
    let x = (i % props.horizontal) * props.cellWidth + (1-props.sizeRatio)/2*props.cellWidth || 0
    let row = Math.floor(i / props.horizontal);
    // 默认从下到上：第 1 行在底部，逐行向上
    let rowFromBottom = props.reverseY ? (props.vertical - 1 - row) : row;
    let y = rowFromBottom * props.cellHeight + (1-props.sizeRatio)/2*props.cellHeight || 0
    holes.push({
      x: x,
      y: y,
      index: idx,
      displayIndex: idx,
    })
  }
  return holes
})

const emit = defineEmits(['toggleItemClick']);
const toggleItemClick = (index: number) => {
  emit('toggleItemClick', index);
};

// 格子内容文本：优先 textField 字段，空则回退旧字段「类型」
const mainText = (index: number) => {
  const cell: any = props.data?.[index];
  if (!cell) return '';
  return cell[props.textField] || cell['类型'] || '';
};
// 备注第二行文本（未配置 remarkField 或为空时返回 ''）
const subText = (index: number) => {
  if (!props.remarkField) return '';
  const cell: any = props.data?.[index];
  return cell?.[props.remarkField] || '';
};
// 是否已占位（「有无」标记为 true）
const isFilled = (index: number) => !!props.data?.[index]?.['有无'];
// 是否有内容（有/无标记为 true 才渲染文本）
const hasContent = (index: number) => !!props.data?.[index]?.['有无'];
</script>

<style lang="less" scoped>
/* 格子配色：
   注意不能用 presentation attribute 写 var()（SVG 属性不解析 CSS 变量），
   所以颜色统一走下面这些类 —— 这也是原来格子颜色一直没跟主题走的原因。
   空位 = 淡淡的凹槽；已占位 = 强调色实底；hover 只提亮描边，不做发光。
   底色整体提亮后，原 0.035 / 0.075 的白色叠层几乎与面板同色（空槽看不出边界），
   所以同步抬到 0.05 / 0.10。 */
.slot-cell{
  fill: rgba(255, 255, 255, 0.05);
  stroke: var(--lx-hairline-2, rgba(255, 255, 255, 0.16));
  stroke-width: 1;
  cursor: pointer;
  transition: fill 0.15s ease, stroke 0.15s ease;
}
.slot-cell:hover{
  fill: rgba(255, 255, 255, 0.10);
  stroke: rgba(255, 255, 255, 0.30);
}
.slot-cell.is-filled{
  fill: var(--lx-accent, #5E6AD2);
  stroke: rgba(124, 134, 232, 0.85);
}
.slot-cell.is-filled:hover{
  fill: var(--lx-accent-2, #7C86E8);
}
.slot-index{
  fill: var(--lx-text-3, rgba(255, 255, 255, 0.4));
  pointer-events: none;
  user-select: none;
}
.slot-index.is-filled{
  fill: rgba(255, 255, 255, 0.66);
}
.slot-text{
  fill: #FFFFFF;
  pointer-events: none;
  user-select: none;
}
.slot-sub{
  fill: rgba(226, 231, 255, 0.72);
  pointer-events: none;
  user-select: none;
}
</style>
