<template>
  <div class="refresh-time" :class="{ loading }" title="点击触发数据刷新" @click="handleClick">
    <IconRefresh :size="11" :spin="loading" />
    <span>{{ text }}</span>
  </div>
</template>

<style lang="less" scoped>
.refresh-time{
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border: 1px solid transparent;
  border-radius: var(--lx-r-sm, 6px);
  font-family: var(--lx-mono, monospace);
  font-size: 0.6rem;
  color: var(--lx-text-3, var(--color-text-3));
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
  &:hover{
    color: var(--lx-text-1, var(--color-text-1));
    background: var(--lx-surface-3, var(--color-fill-2));
    border-color: var(--lx-hairline, var(--color-border-1));
  }
  &.loading{
    cursor: default;
    color: var(--lx-text-2, var(--color-text-2));
  }
  span{
    white-space: nowrap;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  /** 更新时间 YYYY-MM-DD HH:mm:ss */
  time: {
    type: String,
    default: '',
  },
  /** 拉取中 */
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['refresh']);

const text = computed(() => {
  if (props.loading) return '获取中...';
  if (!props.time) return '点击刷新';
  const t = dayjs(props.time);
  if (!t.isValid()) return `更新于 ${props.time}`;
  // 当天只显示时分秒，跨天带日期
  return t.isSame(dayjs(), 'day') ? `更新于 ${t.format('HH:mm:ss')}` : `更新于 ${t.format('MM-DD HH:mm')}`;
});

const handleClick = () => {
  if (props.loading) return;
  emit('refresh');
};
</script>
