<script setup lang="ts">
import LayeredAssistant from "./LayeredAssistant.vue";
defineProps<{ state: "idle" | "listening" | "thinking" | "speaking" }>();
</script>

<template><LayeredAssistant variant="ceramic" :state="state" /></template>
