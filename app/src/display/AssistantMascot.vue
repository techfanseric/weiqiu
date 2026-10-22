<script setup lang="ts">
defineProps<{
  src: string;
  state: "idle" | "listening" | "thinking" | "speaking";
  compact?: boolean;
}>();
</script>

<template>
  <span class="mascot" :class="[{ compact }, `mascot-${state}`]" :data-state="state" aria-hidden="true">
    <span class="mascot-aura"></span>
    <span class="mascot-ripple ripple-one"></span>
    <span class="mascot-ripple ripple-two"></span>
    <img class="mascot-character" :src="src" alt="" draggable="false" />
    <span class="mascot-orbit"><i></i><i></i><i></i></span>
    <span class="mascot-voice"><i></i><i></i><i></i><i></i><i></i></span>
  </span>
</template>

<style scoped>
.mascot { position: relative; display: inline-block; width: 100%; height: 100%; isolation: isolate; pointer-events: none; }
.mascot .mascot-character { position: relative; z-index: 1; display: block; width: 100%; height: 100%; margin: 0; object-fit: contain; transform-origin: 50% 82%; filter: drop-shadow(0 5px 5px #235a8a18); will-change: transform; }
.mascot-aura { position: absolute; inset: 45% 17% 4%; border-radius: 50%; background: #a0dcf5; filter: blur(14px); opacity: .3; }
.mascot-idle .mascot-character { animation: mascot-breathe 4.2s ease-in-out infinite; }
.mascot-idle .mascot-aura { animation: mascot-glow 4.2s ease-in-out infinite; }
.mascot-ripple { position: absolute; left: 14%; top: 21%; width: 72%; aspect-ratio: 1; border: 1.5px solid #50bdd0; border-radius: 50%; opacity: 0; }
.mascot-listening .mascot-character { animation: mascot-listen 2.4s ease-in-out infinite; }
.mascot-listening .mascot-ripple { animation: mascot-listen-wave 2.2s ease-out infinite; }
.mascot-listening .ripple-two { animation-delay: 1.1s; }
.mascot-orbit { position: absolute; inset: 6% 5% 19%; opacity: 0; }
.mascot-orbit i { position: absolute; width: 7px; height: 7px; border-radius: 50%; background: #3baebf; box-shadow: 0 0 8px #75d6e680; }
.mascot-orbit i:nth-child(1) { top: 8%; left: 22%; }
.mascot-orbit i:nth-child(2) { top: 30%; right: 0; width: 5px; height: 5px; opacity: .7; }
.mascot-orbit i:nth-child(3) { bottom: 4%; left: 16%; width: 4px; height: 4px; opacity: .45; }
.mascot-thinking .mascot-character { animation: mascot-ponder 3.2s ease-in-out infinite; }
.mascot-thinking .mascot-orbit { opacity: 1; animation: mascot-orbit 5s linear infinite; }
.mascot-voice { position: absolute; z-index: 2; right: -7%; top: 40%; height: 27px; display: flex; align-items: center; gap: 3px; opacity: 0; padding: 5px 7px; border-radius: 12px; background: #f3fbffeb; border: 1px solid #c9e7f2; }
.mascot-voice i { width: 3px; height: 16px; background: #3289bd; border-radius: 2px; transform: scaleY(.35); }
.mascot-speaking .mascot-character { animation: mascot-talk 1.2s ease-in-out infinite; }
.mascot-speaking .mascot-voice { opacity: 1; }
.mascot-speaking .mascot-voice i { animation: mascot-equalizer .7s ease-in-out infinite alternate; }
.mascot-voice i:nth-child(2) { animation-delay: -.25s; }
.mascot-voice i:nth-child(3) { animation-delay: -.5s; }
.mascot-voice i:nth-child(4) { animation-delay: -.15s; }
.mascot-voice i:nth-child(5) { animation-delay: -.4s; }
.compact .mascot-aura { filter: blur(7px); }
.compact .mascot-orbit i { width: 4px; height: 4px; }
.compact .mascot-voice { right: -4%; height: 17px; padding: 3px 4px; gap: 2px; }
.compact .mascot-voice i { width: 2px; height: 10px; }
@keyframes mascot-breathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4%) scale(1.015); } }
@keyframes mascot-glow { 50% { opacity: .5; transform: scale(1.08); } }
@keyframes mascot-listen { 0%,100% { transform: translateY(-1%) rotate(-3deg); } 50% { transform: translateY(-3%) rotate(-5deg) scale(1.025); } }
@keyframes mascot-listen-wave { 0% { transform: scale(.85); opacity: 0; } 15% { opacity: .55; } 100% { transform: scale(1.5); opacity: 0; } }
@keyframes mascot-ponder { 0%,100% { transform: translateY(-2%) rotate(3deg); } 50% { transform: translateY(-4%) rotate(-3deg); } }
@keyframes mascot-orbit { to { transform: rotate(360deg); } }
@keyframes mascot-talk { 0%,100% { transform: translateY(0) rotate(-1deg); } 25% { transform: translateY(-3%) rotate(1deg) scaleY(1.015); } 55% { transform: translateY(-1%); } 75% { transform: translateY(-2%) rotate(1deg); } }
@keyframes mascot-equalizer { to { transform: scaleY(1); } }
@media (prefers-reduced-motion: reduce) {
  .mascot *, .mascot .mascot-character { animation: none !important; will-change: auto; }
  .mascot-listening .ripple-one { opacity: .4; transform: scale(1.15); }
  .mascot-speaking .mascot-voice i:nth-child(2n) { transform: scaleY(.8); }
}
</style>
