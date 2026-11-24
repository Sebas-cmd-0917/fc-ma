<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { borrarFoto, cambiarFoto } from '../composables/recuerdos.js'
import { config } from '../data/planes.js'

// Visor a pantalla completa. Recibe una lista de fotos (de un bono o de un día
// del calendario) y la foto con la que abre.
const props = defineProps({
  fotos: { type: Array, required: true },
  inicial: { type: String, default: null },
  titulo: { type: String, default: '' },
  etiqueta: { type: Function, default: () => '' }, // grupo → nombre del lugar
  recienGuardada: { type: Boolean, default: false },
})
const emit = defineEmits(['cerrar'])

const abierta = ref(props.inicial || props.fotos[0]?.id)
const foto = computed(() => props.fotos.find((f) => f.id === abierta.value) || null)
const indice = computed(() => props.fotos.findIndex((f) => f.id === abierta.value))
const lugar = computed(() => (foto.value ? props.etiqueta(foto.value.grupo) : ''))
const confirmarBorrar = ref(false)
const editando = ref(false)
const textoNuevo = ref('')
const diaNuevo = ref('')
const bienvenida = ref(props.recienGuardada)
const enviada = ref(false)

watch(abierta, () => { confirmarBorrar.value = false; editando.value = false; enviada.value = false })
watch(foto, (f) => { if (!f) emit('cerrar') })
onMounted(() => { document.documentElement.style.overflow = 'hidden' })
onUnmounted(() => { document.documentElement.style.overflow = '' })

function paso(n) {
  const lista = props.fotos
  if (lista.length < 2) return
  bienvenida.value = false
  abierta.value = lista[(indice.value + n + lista.length) % lista.length].id
}
function teclas(e) {
  if (e.key === 'Escape') emit('cerrar')
  if (e.key === 'ArrowRight') paso(1)
  if (e.key === 'ArrowLeft') paso(-1)
}
let x0 = null
function tocaInicio(e) { x0 = e.touches[0].clientX }
function tocaFin(e) {
  if (x0 === null || editando.value) return
  const d = e.changedTouches[0].clientX - x0
  x0 = null
  if (Math.abs(d) > 50) paso(d < 0 ? 1 : -1)
}

const slug = (t) => (t || 'mari').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const nombreArchivo = computed(() => `recuerdo-${slug(lugar.value)}-${foto.value?.dia || ''}.jpg`)
const fechaLarga = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const mensaje = computed(() => {
  const f = foto.value
  return `📸 Un recuerdo de ${lugar.value}, ${fechaLarga(f.dia)}${f.texto ? `\n“${f.texto}”` : ''}\n\n— ${config.nombre} 💜`
})
const archivo = () => new File([foto.value.blob], nombreArchivo.value, { type: 'image/jpeg' })
const puedeCompartir = computed(() => {
  if (!foto.value || !navigator.canShare) return false
  try { return navigator.canShare({ files: [archivo()] }) } catch { return false }
})

// WhatsApp no deja adjuntar fotos desde un link, así que:
// - En el celular se abre el menú de compartir con la foto y ella escoge el chat de Joan.
// - Si el navegador no puede compartir archivos, se descarga la foto y se abre
//   el chat de Joan con el mensaje para que ella la adjunte.
async function mandarAJoan() {
  bienvenida.value = false
  if (puedeCompartir.value) {
    try {
      await navigator.share({ files: [archivo()], text: mensaje.value })
      enviada.value = true
    } catch {}
    return
  }
  const a = document.createElement('a')
  a.href = foto.value.url
  a.download = nombreArchivo.value
  a.click()
  const texto = `${mensaje.value}\n\n(Te adjunto la foto que acabo de descargar)`
  window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  enviada.value = true
}

async function borrar() {
  if (!confirmarBorrar.value) { confirmarBorrar.value = true; return }
  const f = foto.value
  const siguiente = props.fotos.length > 1 ? props.fotos[(indice.value + 1) % props.fotos.length].id : null
  if (siguiente) abierta.value = siguiente
  await borrarFoto(f.grupo, f.id).catch(() => {})
}
function editar() {
  textoNuevo.value = foto.value.texto
  diaNuevo.value = foto.value.dia
  editando.value = true
}
async function guardarEdicion() {
  await cambiarFoto(foto.value.grupo, foto.value.id, { texto: textoNuevo.value, dia: diaNuevo.value || foto.value.dia }).catch(() => {})
  editando.value = false
}
</script>

<template>
  <Teleport to="body">
    <div class="vs" role="dialog" aria-modal="true" :aria-label="`Recuerdo de ${lugar}`" tabindex="-1" @keydown="teclas" @vue:mounted="({ el }) => el.focus()">
      <header class="vs__barra">
        <p class="vs__lugar">{{ titulo || lugar }}<template v-if="fotos.length > 1"> · {{ indice + 1 }} de {{ fotos.length }}</template></p>
        <button type="button" class="vs__cerrar" aria-label="Cerrar" @click="emit('cerrar')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </header>

      <div v-if="foto" class="vs__escena" @touchstart.passive="tocaInicio" @touchend="tocaFin">
        <button v-if="fotos.length > 1" type="button" class="vs__flecha vs__flecha--izq" aria-label="Foto anterior" @click="paso(-1)">‹</button>
        <figure :key="foto.id" class="vs__polaroid" :class="indice % 2 ? 'vs__polaroid--der' : 'vs__polaroid--izq'">
          <img :src="foto.url" :alt="foto.texto || `Recuerdo de ${lugar}`" width="1080" height="1350" />
          <figcaption>
            <template v-if="!editando">
              <span class="vs__pie">{{ foto.texto || lugar }}</span>
              <small>{{ fechaLarga(foto.dia) }}<template v-if="titulo"> · {{ lugar }}</template></small>
            </template>
            <form v-else class="vs__editar" @submit.prevent="guardarEdicion">
              <input v-model="textoNuevo" type="text" maxlength="70" aria-label="Pie de foto" placeholder="Pie de foto" />
              <input v-model="diaNuevo" type="date" aria-label="Día del recuerdo" />
              <button type="submit">Listo</button>
            </form>
          </figcaption>
        </figure>
        <button v-if="fotos.length > 1" type="button" class="vs__flecha vs__flecha--der" aria-label="Foto siguiente" @click="paso(1)">›</button>
      </div>

      <footer v-if="foto" class="vs__acciones">
        <p v-if="bienvenida" class="vs__nota">¡Guardada en tus recuerdos! ✨ ¿Se la mandas a Joan?</p>
        <p v-else-if="enviada" class="vs__nota">Listo, ya le llegó a Joan 💜</p>
        <button type="button" class="vs__principal" @click="mandarAJoan">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          Mandársela a Joan por WhatsApp
        </button>
        <a class="vs__sec" :href="foto.url" :download="nombreArchivo">Descargar</a>
        <button type="button" class="vs__sec" @click="editar">Editar</button>
        <button type="button" class="vs__sec vs__borrar" :class="{ 'vs__borrar--seguro': confirmarBorrar }" @click="borrar">
          {{ confirmarBorrar ? '¿Segura? Toca otra vez' : 'Borrar' }}
        </button>
      </footer>
    </div>
  </Teleport>
</template>

<style scoped>
/* ---- Visor a pantalla completa ---- */
.vs {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(70vmax 50vmax at 50% 30%, rgba(244, 198, 228, .55), transparent 60%),
    var(--texto);
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
  width: min(88vw, 400px, (100dvh - 19rem) * .8);
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
.vs__borrar--seguro { color: var(--rosa-pastel); }

.vs { animation: vs-entra .35s var(--ease); }
@keyframes vs-entra { from { opacity: 0; } }
.vs__principal { display: flex; align-items: center; justify-content: center; gap: .5rem; }
.vs__acciones .vs__sec { grid-column: span 2; }
.vs__acciones { position: relative; z-index: 2; }
.vs__nota {
  grid-column: 1 / -1;
  margin: 0 0 .5rem;
  text-align: center;
  font: italic 400 1.05rem var(--f-display);
  color: var(--rosa-pastel);
}
.vs__editar { flex-wrap: wrap; }
.vs__editar input[type='date'] { flex: 1 1 8rem; }
</style>
