<script setup>
defineProps({ size: { type: Number, default: 56 } })
const id = 'c' + Math.random().toString(36).slice(2, 7)
</script>

<template>
  <svg class="corona" :width="size" :height="size * 0.72" viewBox="0 0 100 72" aria-hidden="true">
    <defs>
      <linearGradient :id="id" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f6e2a8" />
        <stop offset=".5" stop-color="#e2b866" />
        <stop offset="1" stop-color="#f4dca0" />
      </linearGradient>
    </defs>
    <path :fill="`url(#${id})`" d="M8 60 L4 18 L28 38 L50 6 L72 38 L96 18 L92 60 Z" />
    <rect x="8" y="58" width="84" height="10" rx="3" :fill="`url(#${id})`" />
    <circle cx="4" cy="16" r="5" fill="#c7b0f5" /><circle cx="50" cy="6" r="6" fill="#f4c6e4" /><circle cx="96" cy="16" r="5" fill="#c7b0f5" />
    <circle cx="30" cy="63" r="3.2" fill="#9b6ef0" /><circle cx="50" cy="63" r="3.6" fill="#e58fd1" /><circle cx="70" cy="63" r="3.2" fill="#9b6ef0" />
  </svg>
</template>

<style scoped>
.corona { display: block; filter: drop-shadow(0 6px 10px rgba(124, 77, 216, .3)); }
</style>
