<script setup>
// Ilustraciones pastel para los lugares que aún no tienen foto.
defineProps({ escena: { type: String, default: 'luces' }, lugar: { type: String, default: '' } })
const luces = Array.from({ length: 22 }, (_, i) => ({
  x: 10 + ((i * 47) % 280), y: 20 + ((i * 29) % 120), r: 2 + (i % 3), c: ['#fff6c9', '#f7bcd6', '#cdb8f0', '#ffd9a8'][i % 4], d: (i % 5) * 0.4,
}))
</script>

<template>
  <svg class="portada" viewBox="0 0 300 375" role="img" :aria-label="lugar" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="cieloNoche" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3f2380" /><stop offset="1" stop-color="#b07fe0" />
      </linearGradient>
      <linearGradient id="cieloDia" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d4c0fb" /><stop offset="1" stop-color="#f6dff3" />
      </linearGradient>
    </defs>

    <!-- Luces: ciudad con guirnaldas -->
    <g v-if="escena === 'luces' || escena === 'ciudad'">
      <rect width="300" height="375" fill="url(#cieloNoche)" />
      <g v-if="escena === 'ciudad'" fill="#5d4a8c" opacity=".7">
        <path d="M0 250 L40 150 L80 230 L130 120 L190 220 L240 140 L300 230 V375 H0Z" />
      </g>
      <g fill="#3e2a5e">
        <rect x="10" y="240" width="40" height="135" rx="4" /><rect x="55" y="200" width="34" height="175" rx="4" />
        <rect x="95" y="255" width="50" height="120" rx="4" /><rect x="150" y="215" width="38" height="160" rx="4" />
        <rect x="193" y="250" width="44" height="125" rx="4" /><rect x="242" y="225" width="48" height="150" rx="4" />
      </g>
      <g fill="#ffe7a8" opacity=".8">
        <rect v-for="n in 18" :key="n" :x="16 + ((n * 37) % 268)" :y="255 + ((n * 23) % 100)" width="6" height="8" rx="1" />
      </g>
      <path d="M0 70 Q75 120 150 70 T300 70" fill="none" stroke="#f7bcd6" stroke-width="1.2" opacity=".6" />
      <path d="M0 130 Q75 175 150 130 T300 130" fill="none" stroke="#cdb8f0" stroke-width="1.2" opacity=".6" />
      <circle v-for="(l, i) in luces" :key="i" class="brilla" :cx="l.x" :cy="l.y" :r="l.r" :fill="l.c" :style="{ animationDelay: l.d + 's' }" />
    </g>

    <!-- Pinos: Mesa de los Santos -->
    <g v-else-if="escena === 'pinos'">
      <rect width="300" height="375" fill="url(#cieloDia)" />
      <ellipse cx="80" cy="110" rx="70" ry="18" fill="#fff" opacity=".7" /><ellipse cx="220" cy="80" rx="55" ry="14" fill="#fff" opacity=".6" />
      <path d="M0 260 Q150 200 300 250 V375 H0Z" fill="#cdb8f0" />
      <g fill="#8a63c9">
        <path d="M40 300 L70 180 L100 300Z" /><path d="M95 310 L135 150 L175 310Z" /><path d="M170 300 L200 190 L230 300Z" />
      </g>
      <g fill="#6b4ca6">
        <path d="M215 330 L255 170 L295 330Z" /><path d="M-10 340 L25 200 L60 340Z" />
      </g>
      <path d="M0 330 Q150 290 300 335 V375 H0Z" fill="#f7bcd6" />
      <path d="M150 60 q8 -10 16 0 q8 -10 16 0" fill="none" stroke="#3e2a5e" stroke-width="2" stroke-linecap="round" />
    </g>

    <!-- Pueblo: Barichara -->
    <g v-else-if="escena === 'pueblo'">
      <rect width="300" height="375" fill="url(#cieloNoche)" />
      <g fill="#f3e6dc">
        <path d="M110 250 V150 L150 110 L190 150 V250Z" /><rect x="20" y="220" width="80" height="80" /><rect x="200" y="215" width="85" height="85" />
      </g>
      <g fill="#e07aab"><path d="M15 222 L60 190 L105 222Z" /><path d="M195 217 L242 185 L290 217Z" /></g>
      <rect x="140" y="170" width="20" height="30" rx="10" fill="#3e2a5e" />
      <path d="M0 300 H300 V375 H0Z" fill="#b89ad8" />
      <path d="M0 300 H300" stroke="#8a63c9" stroke-width="2" stroke-dasharray="6 8" />
      <circle v-for="(l, i) in luces.slice(0, 14)" :key="i" class="brilla" :cx="l.x" :cy="l.y + 20" :r="l.r" :fill="l.c" :style="{ animationDelay: l.d + 's' }" />
    </g>

    <!-- Campo: Lebrija -->
    <g v-else-if="escena === 'campo'">
      <rect width="300" height="375" fill="url(#cieloDia)" />
      <circle cx="230" cy="90" r="34" fill="#ffd9a8" />
      <path d="M0 230 Q90 180 180 220 T300 210 V375 H0Z" fill="#cdb8f0" />
      <path d="M0 290 Q120 240 300 290 V375 H0Z" fill="#b89ad8" />
      <g>
        <rect x="70" y="200" width="10" height="70" fill="#6b4ca6" /><circle cx="75" cy="190" r="34" fill="#8a63c9" />
        <ellipse cx="62" cy="200" rx="7" ry="9" fill="#cdeec0" /><ellipse cx="90" cy="180" rx="7" ry="9" fill="#cdeec0" />
      </g>
      <path d="M0 330 Q150 300 300 335 V375 H0Z" fill="#f7bcd6" />
    </g>

    <!-- Café -->
    <g v-else>
      <rect width="300" height="375" fill="url(#cieloDia)" />
      <rect x="80" y="180" width="120" height="110" rx="20" fill="#fffafd" />
      <path d="M200 205 q40 0 30 40 q-8 20 -30 18" fill="none" stroke="#fffafd" stroke-width="12" />
      <path d="M115 160 q-10 -20 0 -40 M145 160 q-10 -20 0 -40 M175 160 q-10 -20 0 -40" stroke="#8a63c9" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
  </svg>
</template>

<style scoped>
.portada { display: block; width: 100%; aspect-ratio: 4 / 5; border-radius: 2px; }
.brilla { animation: brilla 2.4s ease-in-out infinite; }
@keyframes brilla { 50% { opacity: .25; } }
</style>
