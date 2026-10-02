<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{ text: string }>();
const emit = defineEmits<{
  reading: [value: { text: string; duration: number }];
  pause: [value: { text: string; paused: boolean }];
}>();
const viewport = ref<HTMLElement>();
const content = ref<HTMLElement>();
const distance = ref(0);
const hovered = ref(false);
const focused = ref(false);
const paused = computed(() => hovered.value || focused.value);
const duration = computed(() => (distance.value / 28) * 1000);
let observer: ResizeObserver;

function measure() {
  if (!viewport.value || !content.value) return;
  const width = content.value.scrollWidth;
  distance.value = width > viewport.value.clientWidth + 1 ? width + 64 : 0;
  emit("reading", {
    text: props.text,
    // Allow one complete pass, including the initial pause and time at the end.
    duration: distance.value ? 1500 + duration.value + 2500 : 6000,
  });
}
watch(paused, (value) => emit("pause", { text: props.text, paused: value }));
watch(() => props.text, measure, { flush: "post" });
onMounted(() => {
  observer = new ResizeObserver(measure);
  observer.observe(viewport.value!);
  observer.observe(content.value!);
  measure();
});
onUnmounted(() => observer.disconnect());
</script>

<template>
  <div
    ref="viewport"
    class="caption-window"
    :tabindex="distance ? 0 : undefined"
    :title="text"
    @pointerenter="hovered = true"
    @pointerleave="hovered = false"
    @focusin="focused = true"
    @focusout="focused = false"
    @keydown.space.stop.prevent
  >
    <div
      class="caption-track"
      :class="{ rolling: distance, paused }"
      :style="{
        '--caption-shift': `-${distance}px`,
        '--caption-duration': `${duration}ms`,
      }"
    >
      <span ref="content" class="caption-text">{{ text }}</span>
      <span v-if="distance" class="caption-copy" aria-hidden="true">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
.caption-window {
  flex: 1;
  min-width: 0;
  height: 30px;
  overflow: hidden;
  font-size: 20px;
  line-height: 30px;
  color: #17457a;
}
.caption-window:focus-visible {
  outline: 2px solid #014ec0;
  outline-offset: 3px;
}
.caption-track {
  display: flex;
  width: max-content;
  gap: 64px;
  white-space: nowrap;
}
.caption-track > span {
  flex-shrink: 0;
}
.caption-track.rolling {
  animation: caption-marquee var(--caption-duration) linear 1500ms infinite;
}
.caption-track.paused {
  animation-play-state: paused;
}
@keyframes caption-marquee {
  to {
    transform: translateX(var(--caption-shift));
  }
}
@media (prefers-reduced-motion: reduce) {
  .caption-window {
    overflow-x: auto;
    scrollbar-width: none;
  }
  .caption-window::-webkit-scrollbar {
    display: none;
  }
  .caption-track.rolling {
    animation: none;
  }
  .caption-copy {
    display: none;
  }
}
</style>
