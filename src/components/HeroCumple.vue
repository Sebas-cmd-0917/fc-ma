<script setup>
import Corona from './Corona.vue'
defineProps({
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
})

// Confeti: posiciones fijas pseudoaleatorias (sin JS en bucle)
const chispas = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 0.73) % 6,
  dur: 7 + ((i * 1.3) % 5),
  size: 8 + (i % 4) * 4,
  color: ['var(--lila)', 'var(--oro)', 'var(--rosa-pastel)', 'var(--violeta)'][i % 4],
}))
</script>

<template>
  <section class="hero">
    <div class="hero__chispas" aria-hidden="true">
      <i
        v-for="(c, i) in chispas"
        :key="i"
        :style="{
          left: c.left + '%',
          width: c.size + 'px',
          height: c.size + 'px',
          background: c.color,
          animationDelay: c.delay + 's',
          animationDuration: c.dur + 's',
        }"
      />
    </div>

    <p class="hero__fecha">
      <span class="hero__dia">{{ edad }}</span>
      <span>19 nov<br />hoy cumples</span>
    </p>

    <h1 class="hero__titulo">
      <span class="l1">Feliz</span>
      <span class="l2">cumple&shy;años,</span>
      <span class="l3"><Corona class="l3__corona" :size="64" />{{ nombre }}</span>
    </h1>

    <p class="hero__mensaje">Hoy el mundo celebra que existes. Te escribí algo, y además te tengo unos planes guardados para cuando estés en Bucaramanga.</p>

    <a class="hero__cta" href="#carta">
      Lee tu carta
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: auto 1fr auto auto;
  align-content: start;
  padding: calc(1.5rem + env(safe-area-inset-top)) var(--gutter) calc(2rem + env(safe-area-inset-bottom));
  isolation: isolate;
  overflow: hidden;
}

/* Halo cálido detrás del titular */
.hero::before {
  content: '';
  position: absolute;
  width: 120vw;
  max-width: 560px;
  aspect-ratio: 1;
  top: 18%;
  right: -45%;
  background: radial-gradient(circle, rgba(199, 176, 245, .65), transparent 65%);
  z-index: -1;
  animation: respira 9s ease-in-out infinite;
}

.hero__chispas { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.hero__chispas i {
  position: absolute;
  bottom: -20px;
  clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%);
  opacity: 0;
  animation: sube linear infinite;
}

.hero__fecha {
  grid-column: 4 / -1;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: .6rem;
  margin: 0;
  font-size: .75rem;
  line-height: 1.25;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--texto-suave);
  animation: entra .9s var(--ease) both;
}
.hero__dia {
  font: 900 3rem/1 var(--f-display);
  letter-spacing: -.03em;
  color: var(--rosa-fuerte);
}

.hero__titulo {
  grid-column: 1 / -1;
  align-self: center;
  margin: 2rem 0 1.5rem;
  font-family: var(--f-display);
  line-height: .86;
  letter-spacing: -.035em;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}
.hero__titulo span { animation: entra 1s var(--ease) both; }
.l1 {
  grid-column: 1 / -1;
  font-family: var(--f-script);
  font-size: clamp(5rem, 30vw, 9rem);
  font-weight: 400;
  line-height: .9;
  color: var(--violeta);
}
.l2 {
  grid-column: 1 / -1;
  font-size: clamp(2.9rem, 16.5vw, 5.1rem);
  font-weight: 900;
  animation-delay: .12s !important;
}
.l3 {
  grid-column: 2 / -1;
  justify-self: end;
  position: relative;
  margin-top: .35em;
  padding-right: .1em;
  font-family: var(--f-script);
  font-size: clamp(6rem, 38vw, 11rem);
  font-weight: 400;
  line-height: .85;
  background: var(--brillo);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation-delay: .24s !important;
  filter: drop-shadow(0 6px 18px rgba(180, 95, 214, .35));
}
.l3__corona {
  position: absolute;
  top: -.28em;
  left: .32em;
  transform: rotate(-14deg);
  animation: corona 4s ease-in-out infinite;
}

.hero__mensaje {
  grid-column: 2 / -1;
  margin: 0 0 2rem;
  padding-left: 1rem;
  border-left: 2px solid var(--violeta);
  color: var(--texto-suave);
  font-size: 1rem;
  animation: entra 1s var(--ease) .45s both;
}

.hero__cta {
  grid-column: 1 / 5;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  min-height: 52px;
  padding: 0 1.5rem;
  border-radius: 26px 4px 26px 26px;
  background: var(--brillo);
  color: var(--fondo-2);
  box-shadow: 0 12px 28px -12px rgba(138, 99, 201, .7);
  font-weight: 700;
  text-decoration: none;
  animation: entra 1s var(--ease) .6s both;
  transition: transform .2s var(--ease);
}
.hero__cta:active { transform: scale(.96); }
.hero__cta svg { animation: rebota 2s ease-in-out infinite 1.6s; }

@keyframes corona { 50% { transform: rotate(-8deg) translateY(-4px); } }
@keyframes entra { from { opacity: 0; transform: translateY(24px); } }
@keyframes respira { 50% { transform: scale(1.12); opacity: .7; } }
@keyframes rebota { 50% { transform: translateY(4px); } }
@keyframes sube {
  0% { transform: translateY(0) rotate(0); opacity: 0; }
  10% { opacity: .9; }
  100% { transform: translateY(-105dvh) rotate(540deg); opacity: 0; }
}
</style>
