<script setup>
import { computed } from 'vue'
import Corona from './Corona.vue'
import { desglose, dos, enZona, ZONA_ITALIA } from '../composables/tiempo.js'

const props = defineProps({
  ahora: { type: Date, required: true },
  apertura: { type: String, required: true },
  nombre: { type: String, required: true },
})

const falta = computed(() => desglose(new Date(props.apertura) - props.ahora))
const italia = computed(() => {
  const p = enZona(props.ahora, ZONA_ITALIA)
  return `${dos(p.hora)}:${dos(p.minuto)}:${dos(p.segundo)}`
})
const casi = computed(() => falta.value.d === 0 && falta.value.h === 0 && falta.value.m === 0)
</script>

<template>
  <section class="cuenta" :class="{ casi }">
    <span class="cuenta__halo" aria-hidden="true" />

    <span v-for="n in 9" :key="n" class="cuenta__destello estrella" aria-hidden="true" :style="{ left: (n * 37) % 92 + '%', top: (n * 53) % 88 + '%', animationDelay: n * .45 + 's', width: 8 + (n % 3) * 6 + 'px', height: 8 + (n % 3) * 6 + 'px' }" />

    <p class="cuenta__para">Para <span class="cuenta__nombre"><Corona class="cuenta__corona" :size="38" /><em>{{ nombre }}</em></span></p>

    <h1 class="cuenta__titulo">Algo bonito<br /><span>se abre a medianoche</span></h1>

    <div class="cuenta__reloj" role="timer" aria-live="off">
      <div v-if="falta.d > 0" class="cuenta__bloque">
        <b>{{ falta.d }}</b><small>{{ falta.d === 1 ? 'día' : 'días' }}</small>
      </div>
      <div class="cuenta__bloque"><b>{{ dos(falta.h) }}</b><small>horas</small></div>
      <div class="cuenta__bloque"><b>{{ dos(falta.m) }}</b><small>min</small></div>
      <div class="cuenta__bloque cuenta__bloque--seg"><b>{{ dos(falta.s) }}</b><small>seg</small></div>
    </div>

    <p class="cuenta__italia">
      <span class="punto" aria-hidden="true" />
      Hora en Italia · <strong>{{ italia }}</strong>
    </p>

    <p class="cuenta__nota">Vuelve a las 00:00 del 19 de noviembre ✨</p>
  </section>
</template>

<style scoped>
.cuenta {
  position: relative;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-content: center;
  row-gap: 1.75rem;
  padding: calc(2rem + env(safe-area-inset-top)) var(--gutter) calc(2rem + env(safe-area-inset-bottom));
  overflow: hidden;
  isolation: isolate;
}
.cuenta__halo {
  position: absolute;
  z-index: -1;
  width: 140vw;
  max-width: 640px;
  aspect-ratio: 1;
  left: -40%;
  top: 8%;
  background:
    radial-gradient(circle at 35% 40%, rgba(244, 198, 228, .8), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(167, 128, 240, .55), transparent 55%);
  filter: blur(10px);
  animation: flota 10s ease-in-out infinite alternate;
}
.cuenta__para {
  grid-column: 1 / -1;
  margin: 0;
  font-size: .8rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--violeta);
}
.cuenta__nombre { position: relative; display: inline-block; margin-left: .3rem; }
.cuenta__para em {
  font: 400 3.4rem/1 var(--f-script);
  letter-spacing: 0;
  text-transform: none;
  background: var(--brillo);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.cuenta__corona { position: absolute; top: -1.6rem; left: -.4rem; transform: rotate(-16deg); }
.cuenta__destello {
  position: absolute;
  z-index: -1;
  background: var(--oro);
  animation: titila 2.6s ease-in-out infinite;
}
.cuenta__destello:nth-of-type(even) { background: var(--lila); }
@keyframes titila { 0%, 100% { opacity: .15; transform: scale(.6) rotate(0); } 50% { opacity: .9; transform: scale(1) rotate(45deg); } }
.cuenta__titulo {
  grid-column: 1 / 6;
  margin: 0;
  font: 900 clamp(2.6rem, 13vw, 3.8rem)/.95 var(--f-display);
  letter-spacing: -.03em;
}
.cuenta__titulo span {
  display: block;
  margin-top: .3em;
  padding-left: 18%;
  font-weight: 400;
  font-style: italic;
  font-size: .6em;
  color: var(--violeta);
}

.cuenta__reloj {
  grid-column: 1 / -1;
  display: flex;
  gap: .5rem;
  margin-top: .5rem;
}
.cuenta__bloque {
  flex: 1;
  display: grid;
  justify-items: center;
  padding: 1rem .25rem .8rem;
  background: var(--fondo-2);
  border: 1px solid rgba(138, 99, 201, .16);
  border-radius: 22px 6px 22px 22px;
  box-shadow: 0 18px 40px -24px rgba(138, 99, 201, .45);
}
.cuenta__bloque:nth-child(even) { border-radius: 6px 22px 22px 22px; transform: translateY(10px); }
.cuenta__bloque b {
  font: 900 clamp(2rem, 11vw, 2.9rem)/1 var(--f-display);
  font-variant-numeric: tabular-nums;
  color: var(--texto);
}
.cuenta__bloque--seg b { color: var(--rosa-fuerte); }
.cuenta__bloque small {
  margin-top: .3rem;
  font-size: .68rem;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--texto-suave);
}
.casi .cuenta__bloque--seg { animation: late 1s ease-in-out infinite; }

.cuenta__italia {
  grid-column: 2 / -1;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: .5rem;
  margin: 1rem 0 0;
  font-size: .875rem;
  color: var(--texto-suave);
}
.cuenta__italia strong { color: var(--texto); font-variant-numeric: tabular-nums; }
.punto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--rosa-fuerte);
  animation: late 1.4s ease-in-out infinite;
}
.cuenta__nota {
  grid-column: 1 / 6;
  margin: 0;
  padding-left: 1rem;
  border-left: 2px solid var(--rosa-pastel);
  font: italic 400 1.05rem/1.45 var(--f-display);
  color: var(--texto-suave);
}

@keyframes flota { to { transform: translate(12%, 6%) scale(1.1); } }
@keyframes late { 50% { transform: scale(1.12); opacity: .7; } }
</style>
