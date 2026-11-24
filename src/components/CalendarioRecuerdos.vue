<script setup>
import { computed, ref } from 'vue'
import { usarRecuerdos } from '../composables/recuerdos.js'
import { vAparece } from '../composables/vAparece.js'
import VisorRecuerdos from './VisorRecuerdos.vue'

// Calendario de recuerdos: cada foto aparece en el día que ella escogió.
// No hay fechas fijas: solo salen los meses que tienen fotos (sin fotos,
// se muestra el mes actual vacío como adelanto).
defineProps({
  etiquetas: { type: Object, required: true }, // grupo → nombre del lugar
})

const grupos = usarRecuerdos()
const todas = computed(() =>
  Object.values(grupos).flat().sort((a, b) => (a.dia === b.dia ? a.creada - b.creada : a.dia < b.dia ? -1 : 1)),
)
const porDia = computed(() => {
  const m = {}
  for (const f of todas.value) (m[f.dia] ||= []).push(f)
  return m
})

const SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const nombreMes = (a, m) => new Date(a, m, 1).toLocaleDateString('es-CO', { month: 'long' })
const clave = (a, m, d) => `${a}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const meses = computed(() => {
  // claves AAAA-MM con el mes desde 0 (enero = 00)
  const set = new Set()
  for (const dia of Object.keys(porDia.value)) {
    const [a, m] = dia.split('-').map(Number)
    set.add(`${a}-${String(m - 1).padStart(2, '0')}`)
  }
  if (!set.size) {
    const h = new Date()
    set.add(`${h.getFullYear()}-${String(h.getMonth()).padStart(2, '0')}`)
  }
  return [...set].sort().map((k) => {
    const [a, m] = k.split('-').map(Number)
    const primero = (new Date(a, m, 1).getDay() + 6) % 7 // lunes = 0
    const total = new Date(a, m + 1, 0).getDate()
    const dias = Array.from({ length: total }, (_, i) => {
      const id = clave(a, m, i + 1)
      const fotos = porDia.value[id] || []
      return { n: i + 1, id, fotos }
    })
    return { k, anio: a, nombre: nombreMes(a, m), primero, dias, cuantas: dias.reduce((s, d) => s + d.fotos.length, 0) }
  })
})

const abierto = ref(null)
const fotosDia = computed(() => (abierto.value ? porDia.value[abierto.value] || [] : []))
const tituloDia = computed(() =>
  abierto.value ? new Date(`${abierto.value}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : '',
)
</script>

<template>
  <section id="recuerdos" class="cal">
    <header class="cal__cabeza" v-aparece>
      <p class="cal__kicker">Día por día</p>
      <h2 class="cal__titulo">Nuestro<br /><em>calendario</em></h2>
      <p class="cal__intro">
        <template v-if="todas.length">{{ todas.length }} {{ todas.length === 1 ? 'recuerdo guardado' : 'recuerdos guardados' }}. Toca un día para verlos.</template>
        <template v-else>Cada foto que guardes en un bono aparece aquí, en el día que la vivimos.</template>
      </p>
    </header>

    <article v-for="(mes, i) in meses" :key="mes.k" class="cal__mes" :class="i % 2 ? 'cal__mes--der' : 'cal__mes--izq'" v-aparece>
      <h3 class="cal__nombre">
        {{ mes.nombre }} <small>{{ mes.anio }}</small>
      </h3>
      <ol class="cal__grilla" :aria-label="`${mes.nombre} ${mes.anio}`">
        <li v-for="d in SEMANA.map((x, j) => ({ x, j }))" :key="'s' + d.j" class="cal__sem" aria-hidden="true">{{ d.x }}</li>
        <li v-for="dia in mes.dias" :key="dia.id" :style="dia.n === 1 ? { gridColumnStart: mes.primero + 1 } : null">
          <button
            v-if="dia.fotos.length"
            type="button"
            class="cal__dia cal__dia--foto"
            :aria-label="`${dia.n} de ${mes.nombre}: ${dia.fotos.length} ${dia.fotos.length === 1 ? 'foto' : 'fotos'}`"
            @click="abierto = dia.id"
          >
            <img :src="dia.fotos[0].url" alt="" loading="lazy" decoding="async" width="80" height="100" />
            <span class="cal__n">{{ dia.n }}</span>
            <span v-if="dia.fotos.length > 1" class="cal__mas">{{ dia.fotos.length }}</span>
          </button>
          <span v-else class="cal__dia">{{ dia.n }}</span>
        </li>
      </ol>
    </article>

    <VisorRecuerdos
      v-if="abierto && fotosDia.length"
      :key="abierto"
      :fotos="fotosDia"
      :titulo="tituloDia"
      :etiqueta="(g) => etiquetas[g] || ''"
      @cerrar="abierto = null"
    />
  </section>
</template>

<style scoped>
.cal {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: clamp(3.5rem, 12vh, 6rem) 0 0;
}
.cal__cabeza { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(6, 1fr); margin-bottom: 2rem; }
.cal__kicker {
  grid-column: 3 / -1;
  justify-self: end;
  margin: 0 0 .75rem;
  font-size: .75rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--violeta);
}
.cal__titulo { grid-column: 1 / -1; margin: 0; font: 900 clamp(2.6rem, 13vw, 4rem)/.9 var(--f-display); letter-spacing: -.02em; text-align: right; }
.cal__titulo em { display: inline-block; margin-top: .1em; font: 400 1.25em/1 var(--f-script); color: var(--rosa-fuerte); padding-right: .6em; }
.cal__intro { grid-column: 2 / -1; margin: 1rem 0 0; text-align: right; font-size: .95rem; color: var(--texto-suave); }

.cal__mes {
  position: relative;
  padding: 1.3rem .8rem 1rem;
  margin-bottom: 2.2rem;
  background: var(--fondo-2);
  border: 1px solid rgba(124, 77, 216, .16);
  box-shadow: 0 18px 40px -24px rgba(124, 77, 216, .45);
}
.cal__mes--izq { grid-column: 1 / -1; margin-right: .4rem; border-radius: 6px 30px 30px 30px; transform: rotate(-.8deg); }
.cal__mes--der { grid-column: 1 / -1; margin-left: .4rem; border-radius: 30px 6px 30px 30px; transform: rotate(.8deg); }
/* El nombre del mes se monta sobre el borde de la tarjeta */
.cal__nombre {
  position: absolute;
  top: -1.35rem;
  margin: 0;
  font: 400 2.5rem/1 var(--f-script);
  color: var(--violeta);
  text-transform: capitalize;
}
.cal__mes--izq .cal__nombre { left: .6rem; }
.cal__mes--der .cal__nombre { right: .6rem; }
.cal__nombre small { font: 700 .75rem var(--f-texto); letter-spacing: .14em; color: var(--texto-suave); }

.cal__grilla {
  list-style: none;
  margin: .6rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .3rem;
}
.cal__sem { text-align: center; font-size: .65rem; font-weight: 700; letter-spacing: .1em; color: var(--texto-suave); padding-bottom: .2rem; }
.cal__dia {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 8px 3px 8px 8px;
  font-size: .8rem;
  color: var(--texto-suave);
  background: var(--fondo-3);
  opacity: .7;
}
.cal__dia--foto {
  padding: 2px;
  border: 0;
  opacity: 1;
  background: var(--fondo-2);
  box-shadow: 0 6px 12px -6px rgba(58, 29, 104, .6), 0 0 0 1.5px var(--lila);
  cursor: pointer;
  transform: rotate(-3deg) scale(1.08);
  z-index: 1;
  transition: transform .2s var(--ease);
}
li:nth-child(even) > .cal__dia--foto { transform: rotate(3deg) scale(1.08); }
.cal__dia--foto:active { transform: scale(.95); }
.cal__dia--foto img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px 2px 6px 6px; }
.cal__n {
  position: absolute;
  left: 3px;
  bottom: 3px;
  padding: 0 .3rem;
  border-radius: 6px;
  background: rgba(253, 249, 255, .9);
  color: var(--texto);
  font-size: .7rem;
  font-weight: 700;
}
.cal__mas {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--violeta);
  color: var(--fondo-2);
  font-size: .65rem;
  font-weight: 700;
}
</style>
