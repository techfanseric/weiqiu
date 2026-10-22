<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";
import { assistantLayers, type AssistantVariant } from "./assistantLayers";
import AssistantLayer from "./AssistantLayer.vue";

const props = withDefaults(defineProps<{
  state: "idle" | "listening" | "thinking" | "speaking";
  variant?: AssistantVariant;
}>(), { variant: "ceramic" });
const layers = computed(() => assistantLayers[props.variant]);
const eyeId = `layered-eye-${getCurrentInstance()!.uid}`;
</script>

<template>
  <span class="layered-rig" :class="[`layered-${state}`, `variant-${variant}`]" :data-rig="variant">
    <span class="layered-arm arm-left"><span class="arm-part"><AssistantLayer :part="layers.arm" /></span></span>
    <span class="layered-arm arm-right"><span class="arm-part"><AssistantLayer :part="layers.arm" /></span></span>
    <AssistantLayer class="layered-body" :part="layers.body" />
    <span class="layered-head">
      <AssistantLayer :part="layers.head" />
      <svg class="layered-face" viewBox="0 0 100 100" aria-hidden="true">
        <defs><radialGradient :id="eyeId" cx="35%" cy="25%" r="80%"><stop offset="0" stop-color="#265b94" /><stop offset=".65" stop-color="#073471" /><stop offset="1" stop-color="#001e52" /></radialGradient></defs>
        <g :transform="layers.faceTransform">
        <g class="layered-brows" fill="none" stroke="#3ab4ca" stroke-width="1.65" stroke-linecap="round">
          <path d="M30 46 Q35 42 40 45" /><path d="M60 45 Q65 42 70 46" />
        </g>
        <g class="layered-gaze">
          <g class="layered-eye eye-left"><ellipse cx="35" cy="55" rx="6.6" ry="8" :fill="variant === 'illustrated' ? '#082c70' : `url(#${eyeId})`" stroke="#d3f1fa" stroke-width=".6" /><circle cx="37" cy="52" r="2.2" fill="white" /></g>
          <g class="layered-eye eye-right"><ellipse cx="65" cy="55" rx="6.6" ry="8" :fill="variant === 'illustrated' ? '#082c70' : `url(#${eyeId})`" stroke="#d3f1fa" stroke-width=".6" /><circle cx="67" cy="52" r="2.2" fill="white" /></g>
        </g>
        <path class="mouth-smile" :d="state === 'thinking' ? 'M47 71 Q51 72 55 70' : 'M44 68 Q50 77 56 68'" fill="none" stroke="#38bcca" stroke-width="1.8" stroke-linecap="round" />
        <g class="mouth-small"><ellipse cx="50" cy="70" rx="4.5" ry="2.6" fill="#09336c" /><path d="M47 71 Q50 69.5 53 71" fill="none" stroke="#6dd5e0" stroke-width="1" /></g>
        <g class="mouth-open"><ellipse cx="50" cy="70" rx="4.2" ry="5.1" fill="#09336c" /><path d="M47.1 72.7 Q50 69.8 52.9 72.7 Q50 76.1 47.1 72.7" fill="#66d2df" /></g>
        </g>
      </svg>
    </span>
  </span>
</template>

<style scoped>
.layered-rig { position: relative; display: block; width: 100%; height: 100%; }
.layered-rig .layer-art { display: block; width: 100%; height: 100%; margin: 0; filter: none; }
.layered-head { position: absolute; left: 4%; top: -3%; width: 92%; height: 72%; z-index: 3; transform-origin: 50% 85%; animation: layered-head-idle 4.8s ease-in-out infinite; }
.layered-face { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.layered-rig .layered-body { position: absolute; left: 15%; top: 43%; width: 70%; height: 66%; z-index: 1; transform-origin: 50% 15%; animation: layered-body-breathe 4s ease-in-out infinite; }
.layered-arm { position: absolute; top: 60%; width: 31%; height: 32%; z-index: 0; transform: rotate(0deg); transition: transform .55s cubic-bezier(.22,.75,.25,1); }
.arm-left { left: 7%; transform-origin: 80% 23%; }
.arm-part { display: block; width: 100%; height: 100%; transform-origin: inherit; animation: layered-arm-idle 4s ease-in-out infinite; }
.arm-right { right: 7%; transform-origin: 20% 23%; }
.arm-right .arm-part { animation-delay: -.6s; animation-direction: reverse; }
.arm-right .layer-art { transform: scaleX(-1); }
.layered-eye { transform-box: fill-box; transform-origin: center; animation: layered-blink 5.6s linear infinite; }
.layered-gaze { transition: transform .4s ease; }
.layered-brows { transform-origin: 50% 50%; transition: transform .4s ease; }
.mouth-small, .mouth-open { opacity: 0; }
.layered-listening .layered-head { animation: layered-head-listen 3s ease-in-out infinite; }
.layered-listening .arm-left { transform: rotate(65deg); }
.layered-listening .arm-left .arm-part { animation: layered-arm-listen 2.8s ease-in-out infinite; }
.layered-listening .layered-brows { transform: translateY(-1px); }
.layered-thinking .layered-head { animation: layered-head-think 3.6s ease-in-out infinite; }
.layered-thinking .layered-gaze { transform: translate(1px,-2px); }
.layered-thinking .layered-brows path:last-child { transform: translateY(-1.2px); }
.layered-thinking .arm-right { z-index: 4; transform: rotate(132deg); }
.layered-thinking .arm-right .arm-part { animation: layered-arm-think 3.6s ease-in-out infinite; }
.layered-speaking .layered-head { animation: layered-head-talk 1.8s ease-in-out infinite; }
.layered-speaking .arm-left { transform: rotate(16deg); }
.layered-speaking .arm-left .arm-part { animation: layered-arm-talk-left 2.2s ease-in-out infinite; }
.layered-speaking .arm-right { transform: rotate(-12deg); }
.layered-speaking .arm-right .arm-part { animation: layered-arm-talk-right 2.6s ease-in-out -.8s infinite; }
.layered-speaking .mouth-smile { animation: layered-mouth-rest 1.1s steps(1,end) infinite; }
.layered-speaking .mouth-small { animation: layered-mouth-small 1.1s steps(1,end) infinite; }
.layered-speaking .mouth-open { animation: layered-mouth-open 1.1s steps(1,end) infinite; }
@keyframes layered-blink { 0%,37%,41%,72%,76%,100% { transform: scaleY(1); } 39%,74% { transform: scaleY(.06); } }
@keyframes layered-body-breathe { 50% { transform: scaleY(1.018); } }
@keyframes layered-head-idle { 50% { transform: translateY(-1.5%) rotate(1deg); } }
@keyframes layered-head-listen { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(-7deg) translateY(-1%); } }
@keyframes layered-head-think { 0%,100% { transform: rotate(5deg); } 50% { transform: rotate(2deg) translateY(-2%); } }
@keyframes layered-head-talk { 0%,100% { transform: rotate(-1deg); } 40% { transform: rotate(2deg) translateY(1.5%); } 70% { transform: rotate(0); } }
@keyframes layered-arm-idle { 50% { transform: rotate(4deg); } }
@keyframes layered-arm-listen { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
@keyframes layered-arm-think { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
@keyframes layered-arm-talk-left { 0%,100% { transform: rotate(0deg); } 40% { transform: rotate(32deg); } 70% { transform: rotate(16deg); } }
@keyframes layered-arm-talk-right { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-28deg); } }
@keyframes layered-mouth-rest { 0%,40%,88%,100% { opacity: 1; } 12%,50% { opacity: 0; } }
@keyframes layered-mouth-small { 0%,28%,40%,62%,88%,100% { opacity: 0; } 12%,50%,76% { opacity: 1; } }
@keyframes layered-mouth-open { 0%,40%,76%,100% { opacity: 0; } 28%,62% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .layered-rig * { animation: none !important; transition: none !important; } }
</style>
