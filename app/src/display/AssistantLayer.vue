<script setup lang="ts">
import type { AssistantLayerPart } from "./assistantLayers";
defineProps<{ part: AssistantLayerPart }>();
</script>

<template>
  <svg class="layer-art" viewBox="0 0 100 100" aria-hidden="true">
    <image :href="part.src" :x="part.x" :y="part.y" :width="part.width" :height="part.height" />
  </svg>
</template>

<style scoped>
.layer-art { display: block; width: 100%; height: 100%; overflow: visible; }
</style>
