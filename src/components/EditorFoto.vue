<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { FILTROS, cargarImagen, exportar, limites, pintar } from '../composables/editarFoto.js'
import { hoy } from '../composables/recuerdos.js'

const props = defineProps({
  archivo: { type: File, required: true },
  lugar: { type: String, default: '' },
  pendientes: { type: Number, default: 0 }, // fotos que siguen en la fila
})
const emit = defineEmits(['guardar', 'saltar', 'cerrar'])

const lienzo = ref(null)
const miniaturas = ref([])
const fuente = ref(null)
const error = ref(false)
const guardando = ref(false)
const texto = ref('')
const dia = ref(hoy())
const estado = reactive({ giro: 0, zoom: 1, dx: 0, dy: 0, filtro: 'natural' })

// ---- Pintado (un cuadro por frame como máximo) ----
let pendiente = false
function repintar() {
  if (pendiente || !fuente.value) return
  pendiente = true
  requestAnimationFrame(() => {
    pendiente = false
    if (lienzo.value) pintar(lienzo.value, fuente.value, estado)
  })
}
let tMinis
function repintarMinis() {
  clearTimeout(tMinis)
  tMinis = setTimeout(() => {
    miniaturas.value.forEach((c, i) => c && pintar(c, fuente.value, { ...estado, filtro: FILTROS[i].id }))
  }, 120)
}
watch(estado, () => repintar())
watch(() => [estado.giro, estado.zoom, estado.dx, estado.dy], () => !arrastrando && repintarMinis())

function acotar() {
  const l = limites(fuente.value, estado.giro, estado.zoom)
  estado.dx = Math.min(l.x, Math.max(-l.x, estado.dx))
  estado.dy = Math.min(l.y, Math.max(-l.y, estado.dy))
}

onMounted(async () => {
  document.documentElement.style.overflow = 'hidden'
  try {
    fuente.value = await cargarImagen(props.archivo)
    await nextTick()
    repintar()
    repintarMinis()
  } catch {
    error.value = true
  }
})
onUnmounted(() => { document.documentElement.style.overflow = '' })

// ---- Gestos: un dedo mueve, dos dedos hacen zoom ----
const punteros = new Map()
let arrastrando = false
let inicio = null
function abajo(e) {
  lienzo.value.setPointerCapture?.(e.pointerId)
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY })
  arrastrando = true
  inicio = foto()
}
function foto() {
  const pts = [...punteros.values()]
  const caja = lienzo.value.getBoundingClientRect()
  const centro = pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 })
  const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0
  return { centro, dist, caja, dx: estado.dx, dy: estado.dy, zoom: estado.zoom }
}
function mover(e) {
  if (!punteros.has(e.pointerId) || !fuente.value) return
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY })
  const ahora = foto()
  if (ahora.dist && inicio.dist) estado.zoom = Math.min(4, Math.max(1, inicio.zoom * (ahora.dist / inicio.dist)))
  estado.dx = inicio.dx + (ahora.centro.x - inicio.centro.x) / inicio.caja.width
  estado.dy = inicio.dy + (ahora.centro.y - inicio.centro.y) / inicio.caja.height
  acotar()
}
function arriba(e) {
  punteros.delete(e.pointerId)
  if (punteros.size) { inicio = foto(); return }
  arrastrando = false
  repintarMinis()
}

function girar() {
  estado.giro = (estado.giro + 90) % 360
  estado.dx = 0
  estado.dy = 0
}
function cambiarZoom(e) {
  estado.zoom = Number(e.target.value)
  acotar()
}
function enderezar() {
  Object.assign(estado, { giro: 0, zoom: 1, dx: 0, dy: 0 })
}

async function guardar() {
  if (!fuente.value || guardando.value) return
  guardando.value = true
  try {
    const blob = await exportar(fuente.value, estado)
    emit('guardar', { blob, texto: texto.value, filtro: estado.filtro, dia: dia.value || hoy() })
  } finally {
    guardando.value = false
  }
}

const zoomTexto = computed(() => `${Math.round(estado.zoom * 100)} %`)
</script>

<template>
  <Teleport to="body">
    <div class="ed" role="dialog" aria-modal="true" aria-label="Editar tu recuerdo">
      <header class="ed__barra">
        <button type="button" class="ed__cancelar" @click="emit('cerrar')">Cancelar</button>
        <p class="ed__titulo">Tu recuerdo</p>
        <button type="button" class="ed__guardar" :disabled="!fuente || guardando" @click="guardar">
          {{ guardando ? 'Guardando…' : 'Guardar' }}
        </button>
      </header>

      <div class="ed__cuerpo">
        <p v-if="lugar" class="ed__lugar">{{ lugar }}</p>

        <figure class="ed__polaroid">
          <div class="ed__marco">
            <canvas
              ref="lienzo"
              width="540"
              height="675"
              class="ed__lienzo"
              @pointerdown="abajo"
              @pointermove="mover"
              @pointerup="arriba"
              @pointercancel="arriba"
            />
            <p v-if="!fuente && !error" class="ed__cargando">Abriendo tu foto…</p>
            <p v-if="error" class="ed__cargando">Esta foto no se pudo abrir. Prueba con otra ✨</p>
          </div>
          <figcaption :class="{ 'ed__pie--vacio': !texto.trim() }">{{ texto.trim() || 'Escribe algo abajo…' }}</figcaption>
        </figure>
        <p class="ed__ayuda">Arrastra para acomodarla · pellizca para acercar</p>

        <div class="ed__herramientas">
          <button type="button" class="ed__girar" aria-label="Girar 90 grados" @click="girar">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Girar
          </button>
          <label class="ed__zoom">
            <span>Zoom <b>{{ zoomTexto }}</b></span>
            <input type="range" min="1" max="4" step="0.01" :value="estado.zoom" @input="cambiarZoom" />
          </label>
          <button type="button" class="ed__reset" @click="enderezar">Volver a como estaba</button>
        </div>

        <fieldset class="ed__filtros">
          <legend>Filtro</legend>
          <button
            v-for="(f, i) in FILTROS"
            :key="f.id"
            type="button"
            class="ed__filtro"
            :class="{ 'ed__filtro--activo': estado.filtro === f.id }"
            :aria-pressed="estado.filtro === f.id"
            @click="estado.filtro = f.id"
          >
            <canvas :ref="(el) => (miniaturas[i] = el)" width="96" height="120" />
            <span>{{ f.nombre }}</span>
          </button>
        </fieldset>

        <label class="ed__texto">
          <span>Un pie de foto</span>
          <input v-model="texto" type="text" maxlength="70" placeholder="Ej: el mejor postre de mi vida" enterkeyhint="done" @keydown.enter="$event.target.blur()" />
        </label>

        <label class="ed__texto ed__dia">
          <span>¿Qué día fue?</span>
          <input v-model="dia" type="date" min="2026-11-19" />
        </label>

        <button v-if="pendientes" type="button" class="ed__saltar" @click="emit('saltar')">
          Saltar esta foto · quedan {{ pendientes }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ed {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(60vmax 40vmax at 100% 0%, rgba(244, 198, 228, .7), transparent 60%),
    radial-gradient(50vmax 40vmax at 0% 100%, rgba(199, 176, 245, .6), transparent 60%),
    var(--fondo);
  color: var(--texto);
  animation: ed-entra .45s var(--ease);
}
@keyframes ed-entra { from { opacity: 0; transform: translateY(24px); } }

.ed__barra {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: .5rem;
  width: 100%;
  max-width: 480px;
  margin-inline: auto;
  padding: max(.6rem, env(safe-area-inset-top)) var(--gutter) .6rem;
}
.ed__titulo { margin: 0; font: 400 1.9rem/1 var(--f-script); color: var(--violeta); }
.ed__cancelar {
  justify-self: start;
  min-height: 44px;
  padding: 0 .3rem;
  border: 0;
  background: none;
  color: var(--texto-suave);
  font-weight: 500;
  cursor: pointer;
}
.ed__guardar {
  justify-self: end;
  min-height: 44px;
  padding: 0 1.2rem;
  border: 0;
  border-radius: 22px 6px 22px 22px;
  background: var(--brillo);
  color: var(--fondo-2);
  font-weight: 700;
  box-shadow: 0 10px 22px -12px rgba(124, 77, 216, .8);
  cursor: pointer;
}
.ed__guardar:disabled { opacity: .5; }

.ed__cuerpo {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  width: 100%;
  max-width: 480px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-content: start;
  padding: .25rem var(--gutter) calc(2rem + env(safe-area-inset-bottom));
}
.ed__lugar {
  grid-column: 1 / -1;
  margin: 0 0 .5rem;
  font-size: .7rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--violeta);
  text-align: center;
}

/* Polaroid: centrada pero levemente inclinada, como recién sacada */
.ed__polaroid {
  grid-column: 1 / -1;
  justify-self: center;
  width: min(100%, 44dvh * .8 + 1.2rem);
  margin: 0;
  padding: .6rem .6rem .2rem;
  background: var(--fondo-2);
  border-radius: 3px;
  box-shadow: 0 22px 44px -22px rgba(58, 29, 104, .5);
  transform: rotate(-1.2deg);
}
.ed__marco { position: relative; }
.ed__lienzo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  border-radius: 2px;
  background: var(--fondo-3);
  touch-action: none;
  cursor: grab;
}
.ed__lienzo:active { cursor: grabbing; }
.ed__cargando {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 1rem;
  text-align: center;
  font: italic 400 1.05rem var(--f-display);
  color: var(--texto-suave);
}
.ed__polaroid figcaption {
  min-height: 2.6rem;
  padding: .3rem .2rem;
  text-align: center;
  font: 400 1.65rem/1.1 var(--f-script);
  color: var(--violeta);
  overflow-wrap: anywhere;
}
.ed__pie--vacio { opacity: .4; }
.ed__ayuda {
  grid-column: 1 / -1;
  margin: .8rem 0 0;
  text-align: center;
  font-size: .75rem;
  color: var(--texto-suave);
}

.ed__herramientas {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: .5rem 1rem;
  margin-top: 1.1rem;
}
.ed__girar {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  min-height: 48px;
  padding: 0 1rem;
  border: 1.5px solid var(--lila);
  border-radius: 24px 6px 24px 24px;
  background: var(--fondo-2);
  color: var(--violeta);
  font-weight: 700;
  cursor: pointer;
}
.ed__zoom { display: grid; gap: .1rem; font-size: .75rem; color: var(--texto-suave); }
.ed__zoom b { color: var(--texto); }
.ed__zoom input { width: 100%; min-height: 32px; accent-color: var(--violeta); }
.ed__reset {
  grid-column: 2;
  justify-self: end;
  min-height: 44px;
  border: 0;
  background: none;
  color: var(--rosa-fuerte);
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
}

.ed__filtros {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .7rem .6rem;
  margin: 1rem 0 0;
  padding: 0;
  border: 0;
}
.ed__filtros legend {
  margin-bottom: .5rem;
  font-size: .7rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--violeta);
}
.ed__filtro {
  display: grid;
  gap: .3rem;
  padding: .3rem .3rem .35rem;
  border: 2px solid transparent;
  border-radius: 14px 4px 14px 14px;
  background: var(--fondo-2);
  color: var(--texto);
  font-size: .8rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform .2s var(--ease), border-color .2s;
}
.ed__filtro:nth-child(odd of .ed__filtro) { transform: rotate(-1deg); }
.ed__filtro:nth-child(even of .ed__filtro) { transform: rotate(1deg); }
.ed__filtro canvas { width: 100%; height: auto; aspect-ratio: 4 / 5; border-radius: 10px 2px 10px 10px; background: var(--fondo-3); }
.ed__filtro--activo { border-color: var(--violeta); color: var(--violeta); font-weight: 700; transform: none !important; }

.ed__texto { grid-column: 1 / -1; display: grid; gap: .4rem; margin-top: 1.2rem; font-weight: 700; font-size: .9rem; }
.ed__texto input {
  min-height: 50px;
  padding: .7rem 1rem;
  border: 1.5px solid var(--lila);
  border-radius: 16px 4px 16px 16px;
  background: var(--fondo-2);
  color: var(--texto);
  font: 400 1rem var(--f-texto);
  outline: none;
}
.ed__dia { grid-column: 1 / 5; margin-top: .9rem; }
.ed__texto input:focus { border-color: var(--violeta); box-shadow: 0 0 0 4px rgba(124, 77, 216, .15); }

.ed__saltar {
  grid-column: 2 / 6;
  min-height: 44px;
  margin-top: 1rem;
  border: 0;
  background: none;
  color: var(--texto-suave);
  font-size: .85rem;
  text-decoration: underline;
  cursor: pointer;
}
</style>
