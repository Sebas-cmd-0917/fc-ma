<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { MAX_FOTOS, usarRecuerdos, guardarFoto, borrarFoto, cambiarTexto } from '../composables/recuerdos.js'
import EditorFoto from './EditorFoto.vue'

const props = defineProps({
  grupo: { type: String, required: true },
  lugar: { type: String, default: '' },
  invitacion: { type: String, default: 'Cuando lo vivamos, guarda aquí las fotos' },
})

const grupos = usarRecuerdos(props.grupo)
const fotos = computed(() => grupos[props.grupo] || [])
const quedan = computed(() => MAX_FOTOS - fotos.value.length)

// ---- Agregar: se pueden escoger varias y se editan una por una ----
const entrada = ref(null)
const fila = ref([])
const aviso = ref('')
function escoger() { entrada.value?.click() }
function alEscoger(e) {
  const archivos = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
  e.target.value = ''
  if (archivos.length > quedan.value) avisar(`Caben ${MAX_FOTOS} fotos por bono. Tomé las primeras ${quedan.value}.`)
  fila.value = archivos.slice(0, quedan.value)
}
async function alGuardar(datos) {
  try {
    await guardarFoto(props.grupo, datos)
    navigator.vibrate?.(25)
  } catch {
    avisar('No se pudo guardar la foto. ¿Tienes espacio en el celular?')
  }
  fila.value = fila.value.slice(1)
}
let tAviso
function avisar(t) {
  aviso.value = t
  clearTimeout(tAviso)
  tAviso = setTimeout(() => (aviso.value = ''), 5000)
}

// ---- Visor ----
const abierta = ref(null)
const foto = computed(() => fotos.value.find((f) => f.id === abierta.value) || null)
const indice = computed(() => fotos.value.findIndex((f) => f.id === abierta.value))
const confirmarBorrar = ref(false)
const editandoTexto = ref(false)
const textoNuevo = ref('')
watch(abierta, (id) => {
  confirmarBorrar.value = false
  editandoTexto.value = false
  document.documentElement.style.overflow = id ? 'hidden' : ''
})
onUnmounted(() => { if (abierta.value) document.documentElement.style.overflow = '' })

function paso(n) {
  const lista = fotos.value
  if (!lista.length) return
  abierta.value = lista[(indice.value + n + lista.length) % lista.length].id
}
function teclas(e) {
  if (e.key === 'Escape') abierta.value = null
  if (e.key === 'ArrowRight') paso(1)
  if (e.key === 'ArrowLeft') paso(-1)
}
// Deslizar a los lados para pasar de foto
let x0 = null
function tocaInicio(e) { x0 = e.touches[0].clientX }
function tocaFin(e) {
  if (x0 === null) return
  const d = e.changedTouches[0].clientX - x0
  x0 = null
  if (Math.abs(d) > 50) paso(d < 0 ? 1 : -1)
}

const nombreArchivo = computed(() => `recuerdo-${(props.lugar || 'mari').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${indice.value + 1}.jpg`)
const puedeCompartir = computed(() => {
  if (!foto.value || !navigator.canShare) return false
  try { return navigator.canShare({ files: [new File([foto.value.blob], 'x.jpg', { type: 'image/jpeg' })] }) } catch { return false }
})
async function compartir() {
  const f = foto.value
  try {
    await navigator.share({
      files: [new File([f.blob], nombreArchivo.value, { type: 'image/jpeg' })],
      text: f.texto ? `${f.texto} 💜` : `${props.lugar} 💜`,
    })
  } catch {}
}
async function borrar() {
  if (!confirmarBorrar.value) { confirmarBorrar.value = true; return }
  const id = abierta.value
  const siguiente = fotos.value.length > 1 ? fotos.value[(indice.value + 1) % fotos.value.length].id : null
  await borrarFoto(props.grupo, id).catch(() => {})
  abierta.value = siguiente
}
function editarTexto() {
  textoNuevo.value = foto.value.texto
  editandoTexto.value = true
}
async function guardarTexto() {
  await cambiarTexto(props.grupo, foto.value.id, textoNuevo.value).catch(() => {})
  editandoTexto.value = false
}
const fecha = (ms) => new Date(ms).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <section class="rc" :class="{ 'rc--lleno': fotos.length }">
    <header class="rc__cabeza">
      <h4 class="rc__titulo">Recuerdos</h4>
      <span v-if="fotos.length" class="rc__cuenta">{{ fotos.length }} / {{ MAX_FOTOS }}</span>
    </header>

    <ul v-if="fotos.length" class="rc__grilla">
      <li v-for="f in fotos" :key="f.id">
        <button type="button" class="rc__mini" :aria-label="f.texto || 'Ver foto'" @click="abierta = f.id">
          <img :src="f.url" alt="" width="216" height="270" loading="lazy" decoding="async" />
        </button>
      </li>
      <li v-if="quedan > 0">
        <button type="button" class="rc__mas" aria-label="Agregar otra foto" @click="escoger">
          <span aria-hidden="true">+</span>
        </button>
      </li>
    </ul>

    <button v-else type="button" class="rc__vacio" @click="escoger">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12.8" r="3.3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
      <span>{{ invitacion }}</span>
    </button>

    <p v-if="aviso" class="rc__aviso" role="status">{{ aviso }}</p>

    <input ref="entrada" type="file" accept="image/*" multiple hidden @change="alEscoger" />

    <EditorFoto
      v-if="fila.length"
      :key="fila[0].name + fila[0].lastModified + fila.length"
      :archivo="fila[0]"
      :lugar="lugar"
      :pendientes="fila.length - 1"
      @guardar="alGuardar"
      @saltar="fila = fila.slice(1)"
      @cerrar="fila = []"
    />

    <Teleport to="body">
      <Transition name="visor">
        <div v-if="foto" class="vs" role="dialog" aria-modal="true" :aria-label="`Recuerdo de ${lugar}`" tabindex="-1" @keydown="teclas" @vue:mounted="({ el }) => el.focus()">
          <header class="vs__barra">
            <p class="vs__lugar">{{ lugar }} · {{ indice + 1 }} de {{ fotos.length }}</p>
            <button type="button" class="vs__cerrar" aria-label="Cerrar" @click="abierta = null">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </header>

          <div class="vs__escena" @touchstart.passive="tocaInicio" @touchend="tocaFin">
            <button v-if="fotos.length > 1" type="button" class="vs__flecha vs__flecha--izq" aria-label="Foto anterior" @click="paso(-1)">‹</button>
            <figure :key="foto.id" class="vs__polaroid" :class="indice % 2 ? 'vs__polaroid--der' : 'vs__polaroid--izq'">
              <img :src="foto.url" :alt="foto.texto || `Recuerdo de ${lugar}`" width="1080" height="1350" />
              <figcaption>
                <template v-if="!editandoTexto">
                  <span class="vs__pie">{{ foto.texto || lugar }}</span>
                  <small>{{ fecha(foto.creada) }}</small>
                </template>
                <form v-else class="vs__editar" @submit.prevent="guardarTexto">
                  <input v-model="textoNuevo" type="text" maxlength="70" aria-label="Pie de foto" enterkeyhint="done" />
                  <button type="submit">Listo</button>
                </form>
              </figcaption>
            </figure>
            <button v-if="fotos.length > 1" type="button" class="vs__flecha vs__flecha--der" aria-label="Foto siguiente" @click="paso(1)">›</button>
          </div>

          <footer class="vs__acciones">
            <button v-if="puedeCompartir" type="button" class="vs__principal" @click="compartir">Compartir</button>
            <a v-else class="vs__principal" :href="foto.url" :download="nombreArchivo">Guardar en el celular</a>
            <a v-if="puedeCompartir" class="vs__sec" :href="foto.url" :download="nombreArchivo">Descargar</a>
            <button type="button" class="vs__sec" @click="editarTexto">Cambiar el texto</button>
            <button type="button" class="vs__sec vs__borrar" :class="{ 'vs__borrar--seguro': confirmarBorrar }" @click="borrar">
              {{ confirmarBorrar ? '¿Segura? Toca otra vez' : 'Borrar' }}
            </button>
          </footer>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.rc { margin-top: 1.4rem; }
.rc__cabeza { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: .6rem; }
.rc__titulo { margin: 0; font: 400 2rem/1 var(--f-script); color: var(--violeta); }
.rc__cuenta { font-size: .72rem; letter-spacing: .14em; color: var(--texto-suave); }

/* Polaroids pequeñas, cada una con su inclinación */
.rc__grilla {
  list-style: none;
  margin: 0 -.2rem;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .7rem .55rem;
}
.rc__grilla li:nth-child(3n + 1) { transform: rotate(-2.5deg); }
.rc__grilla li:nth-child(3n + 2) { transform: rotate(1.5deg) translateY(.35rem); }
.rc__grilla li:nth-child(3n) { transform: rotate(-1deg); }
.rc__mini, .rc__mas {
  display: block;
  width: 100%;
  padding: .28rem .28rem .9rem;
  border: 0;
  border-radius: 2px;
  background: var(--fondo-2);
  box-shadow: 0 8px 18px -10px rgba(58, 29, 104, .5);
  cursor: pointer;
  transition: transform .25s var(--ease);
}
.rc__mini:active, .rc__mas:active { transform: scale(.95); }
.rc__mini img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 1px; }
.rc__mas {
  background: transparent;
  border: 1.5px dashed rgba(124, 77, 216, .45);
  box-shadow: none;
  color: var(--violeta);
  font: 300 2.2rem/1 var(--f-display);
}
.rc__mas span { display: grid; place-items: center; aspect-ratio: 4 / 5; }

.rc__vacio {
  display: flex;
  align-items: center;
  gap: .75rem;
  width: 100%;
  min-height: 56px;
  padding: .7rem 1rem;
  border: 1.5px dashed rgba(124, 77, 216, .4);
  border-radius: 6px 22px 22px 22px;
  background: rgba(232, 220, 252, .45);
  color: var(--violeta);
  font-weight: 700;
  font-size: .9rem;
  text-align: left;
  cursor: pointer;
}
.rc__vacio svg { flex: none; }
.rc__aviso { margin: .6rem 0 0; font-size: .8rem; color: var(--rosa-fuerte); font-weight: 700; }

/* ---- Visor a pantalla completa ---- */
.vs {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(70vmax 50vmax at 50% 30%, rgba(244, 198, 228, .55), transparent 60%),
    rgba(58, 29, 104, .97);
  color: var(--fondo-2);
  outline: none;
}
.vs__barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 480px;
  margin-inline: auto;
  padding: max(.5rem, env(safe-area-inset-top)) var(--gutter) .25rem;
}
.vs__lugar { margin: 0; font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; color: var(--lila); }
.vs__cerrar {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-right: -.5rem;
  border: 0;
  border-radius: 50%;
  background: rgba(253, 249, 255, .12);
  color: var(--fondo-2);
  cursor: pointer;
}

.vs__escena {
  flex: 1;
  position: relative;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: .5rem var(--gutter);
}
.vs__polaroid {
  width: min(88vw, 400px, (100dvh - 15rem) * .8);
  margin: 0;
  padding: .7rem .7rem .4rem;
  background: var(--fondo-2);
  border-radius: 3px;
  box-shadow: 0 30px 60px -20px rgba(20, 8, 40, .7);
  color: var(--texto);
  animation: vs-foto .5s var(--ease);
}
.vs__polaroid--izq { transform: rotate(-1.6deg); }
.vs__polaroid--der { transform: rotate(1.6deg); }
@keyframes vs-foto { from { opacity: 0; translate: 0 16px; } }
.vs__polaroid img { width: 100%; height: auto; aspect-ratio: 4 / 5; border-radius: 2px; }
.vs__polaroid figcaption { display: grid; justify-items: center; min-height: 3.6rem; padding: .35rem .2rem .1rem; text-align: center; }
.vs__pie { font: 400 1.85rem/1.05 var(--f-script); color: var(--violeta); overflow-wrap: anywhere; }
.vs__polaroid small { font-size: .68rem; letter-spacing: .1em; color: var(--texto-suave); }
.vs__editar { display: flex; gap: .4rem; width: 100%; }
.vs__editar input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 0 .8rem;
  border: 1.5px solid var(--lila);
  border-radius: 14px 4px 14px 14px;
  background: var(--fondo-2);
  color: var(--texto);
  font: 400 1rem var(--f-texto);
}
.vs__editar button {
  min-height: 44px;
  padding: 0 1rem;
  border: 0;
  border-radius: 22px 6px 22px 22px;
  background: var(--violeta);
  color: var(--fondo-2);
  font-weight: 700;
}
.vs__flecha {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 44px;
  height: 64px;
  translate: 0 -50%;
  border: 0;
  background: none;
  color: var(--fondo-2);
  font: 300 2.6rem/1 var(--f-display);
  opacity: .75;
  cursor: pointer;
}
.vs__flecha--izq { left: 0; }
.vs__flecha--der { right: 0; }

.vs__acciones {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: .2rem .5rem;
  width: 100%;
  max-width: 480px;
  margin-inline: auto;
  padding: .5rem var(--gutter) max(1rem, env(safe-area-inset-bottom));
}
.vs__principal {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  min-height: 52px;
  border: 0;
  border-radius: 26px 6px 26px 26px;
  background: var(--brillo);
  color: var(--fondo-2);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
}
.vs__sec {
  grid-column: span 2;
  display: grid;
  place-items: center;
  min-height: 44px;
  border: 0;
  background: none;
  color: var(--lila);
  font-size: .82rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
/* Sin "Descargar", los dos botones restantes se reparten el ancho */
.vs__principal:first-child + .vs__sec:not(a) { grid-column: 1 / 4; }
.vs__principal:first-child + .vs__sec:not(a) + .vs__borrar { grid-column: 4 / -1; }
.vs__borrar--seguro { color: var(--rosa-pastel); }

.visor-enter-active, .visor-leave-active { transition: opacity .35s var(--ease); }
.visor-enter-from, .visor-leave-to { opacity: 0; }
</style>
