<script setup>
import { computed, ref } from 'vue'
import CuentaRegresiva from './components/CuentaRegresiva.vue'
import ClaveCarta from './components/ClaveCarta.vue'
import HeroCumple from './components/HeroCumple.vue'
import CartaJoan from './components/CartaJoan.vue'
import BonoDeseo from './components/BonoDeseo.vue'
import BonoPlan from './components/BonoPlan.vue'
import CalendarioRecuerdos from './components/CalendarioRecuerdos.vue'
import { config, carta, bono, planes, vigenciaPlanes, maxBonos, canjesConfirmados } from './data/planes.js'
import { useReloj } from './composables/tiempo.js'
import { vAparece } from './composables/vAparece.js'

const { ahora, simulado } = useReloj()

// Vista privada de Joan: entra directo a la carta con todos los planes abiertos.
// Úsala con ?vista=<config.codigoJoan>. No guarda nada en el celular.
const vistaJoan = new URLSearchParams(location.search).get('vista') === config.codigoJoan

// ---- Etapas: cuenta regresiva → clave → carta y planes ----
const CLAVE_LS = 'mari-carta-abierta'
const leerAbierta = () => { try { return localStorage.getItem(CLAVE_LS) === '1' } catch { return false } }
const cartaAbierta = ref(!simulado && leerAbierta())
function abrirCarta() {
  cartaAbierta.value = true
  if (!simulado) try { localStorage.setItem(CLAVE_LS, '1') } catch {}
  window.scrollTo({ top: 0 })
}
const etapa = computed(() => {
  if (vistaJoan) return 'contenido'
  if (ahora.value < new Date(config.apertura)) return 'cuenta'
  return cartaAbierta.value ? 'contenido' : 'clave'
})

// Nombre de cada grupo de recuerdos (para el calendario)
const etiquetas = Object.fromEntries([['deseo', 'Tu deseo'], ...planes.map((p) => [`plan-${p.id}`, p.lugar])])

// ---- Bonos de planes (sin fechas: ella escoge y canjea) ----
const CANJE_LS = 'mari-bonos-canjeados'
const leerCanjes = () => { try { return JSON.parse(localStorage.getItem(CANJE_LS) || '[]') } catch { return [] } }
const canjeados = ref([...new Set([...canjesConfirmados, ...(vistaJoan || simulado ? [] : leerCanjes())])])
// Solo cuentan los bonos que siguen en la lista (por si Joan quita alguno)
const usados = computed(() => canjeados.value.filter((id) => planes.some((p) => p.id === id)).length)
const quedan = computed(() => Math.max(0, maxBonos - usados.value))
function canjear(id) {
  if (canjeados.value.includes(id) || quedan.value === 0) return
  canjeados.value = [...canjeados.value, id]
  if (!vistaJoan && !simulado) try { localStorage.setItem(CANJE_LS, JSON.stringify(canjeados.value)) } catch {}
}
</script>

<template>
  <div v-if="vistaJoan" class="aviso-prueba">Vista de Joan · sin cuenta regresiva ni clave (Mari no ve esto)</div>
  <div v-else-if="simulado" class="aviso-prueba">
    Modo prueba · {{ ahora.toLocaleString('es-CO', { timeZone: 'Europe/Rome', dateStyle: 'medium', timeStyle: 'medium' }) }} en Italia
  </div>

  <Transition name="etapa" mode="out-in">
    <CuentaRegresiva v-if="etapa === 'cuenta'" :ahora="ahora" :apertura="config.apertura" :nombre="config.nombre" />

    <ClaveCarta v-else-if="etapa === 'clave'" :nombre="config.nombre" :nacimiento="config.nacimiento" @abrir="abrirCarta" />

    <div v-else>
      <HeroCumple :nombre="config.nombre" :edad="config.edad" />
      <CartaJoan :parrafos="carta" :nombre="config.nombre" :firma="config.firma" />
      <BonoDeseo :bono="bono" :nombre="config.nombre" :firma="config.firma" :whatsapp="config.whatsapp" />

      <main id="planes" class="planes">
        <header class="planes__cabeza" v-aparece>
          <p class="planes__kicker">Bucaramanga · {{ vigenciaPlanes }}</p>
          <h2 class="planes__titulo">Tus<br /><em>bonos</em></h2>
          <p class="planes__contador">
            <span>{{ quedan }}</span> {{ quedan === 1 ? 'bono te queda' : 'bonos te quedan' }}
          </p>
          <p class="planes__intro">Aquí tienes {{ planes.length }} planes y puedes canjear {{ maxBonos }}, los que más te provoquen. Tú escoges, lo canjeas y me llega un mensaje. Cuadramos el día y yo me encargo del resto. Tu bono por un deseo es aparte y no cuenta.</p>
        </header>

        <ol class="planes__lista">
          <BonoPlan
            v-for="(plan, i) in planes"
            :key="plan.id"
            :plan="plan"
            :indice="i + 1"
            :lado="i % 2 ? 'der' : 'izq'"
            :canjeado="canjeados.includes(plan.id)"
            :agotado="!canjeados.includes(plan.id) && quedan === 0"
            :max="maxBonos"
            :nombre="config.nombre"
            :whatsapp="config.whatsapp"
            :vigencia="vigenciaPlanes"
            @canjear="canjear"
          />
        </ol>

        <CalendarioRecuerdos :etiquetas="etiquetas" />

        <footer class="planes__pie" v-aparece>
          <p>Feliz cumpleaños número {{ config.edad }}.</p>
          <p class="planes__firma">— {{ config.firma }}</p>
        </footer>
      </main>
    </div>
  </Transition>
</template>

<style scoped>
.aviso-prueba {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: .5rem var(--gutter);
  padding-top: max(.5rem, env(safe-area-inset-top));
  background: var(--violeta);
  color: var(--fondo);
  font-size: .8125rem;
  font-weight: 700;
  text-align: center;
}

.planes {
  padding: clamp(3rem, 12vh, 6rem) var(--gutter) calc(4rem + env(safe-area-inset-bottom));
}

.planes__cabeza {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: end;
  margin-bottom: clamp(2.5rem, 8vh, 4rem);
}
.planes__kicker {
  grid-column: 1 / -1;
  margin: 0 0 .75rem;
  font-size: .75rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--violeta);
}
.planes__titulo {
  grid-column: 1 / 5;
  margin: 0;
  font: 900 clamp(3rem, 15vw, 4.5rem)/.9 var(--f-display);
  letter-spacing: -.02em;
}
.planes__titulo em {
  display: inline-block;
  margin-top: .15em;
  font: 400 1.3em/1 var(--f-script);
  color: var(--rosa-fuerte);
  padding-left: 1.2em;
}
.planes__contador {
  grid-column: 5 / -1;
  margin: 0;
  text-align: right;
  font-size: .8125rem;
  line-height: 1.2;
  color: var(--texto-suave);
}
.planes__contador span {
  display: block;
  font: 700 2.25rem/1 var(--f-display);
  color: var(--texto);
}

.planes__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  display: grid;
  gap: clamp(2.75rem, 9vh, 4rem);
}
/* La línea del tiempo, que sangra fuera de la lista */
.planes__lista::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -2rem;
  bottom: -2rem;
  width: 1px;
  background: linear-gradient(transparent, var(--violeta) 8%, var(--violeta) 92%, transparent);
  opacity: .35;
}

.planes__pie {
  margin-top: clamp(3rem, 10vh, 5rem);
  text-align: center;
  color: var(--texto-suave);
  font-size: .9375rem;
}
.planes__firma {
  margin-top: 1rem;
  font: italic 400 1.5rem var(--f-display);
  color: var(--texto);
}
</style>

<style>
.planes__intro {
  grid-column: 1 / -1;
  margin: 1.25rem 0 0;
  font-size: .95rem;
  color: var(--texto-suave);
}
.etapa-enter-active, .etapa-leave-active { transition: opacity .7s var(--ease), transform .7s var(--ease); }
.etapa-enter-from { opacity: 0; transform: translateY(24px); }
.etapa-leave-to { opacity: 0; transform: translateY(-24px); }
</style>
