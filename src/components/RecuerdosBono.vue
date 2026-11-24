<script setup>
import { computed, ref } from 'vue'
import { MAX_FOTOS, usarRecuerdos, guardarFoto } from '../composables/recuerdos.js'
import EditorFoto from './EditorFoto.vue'
import VisorRecuerdos from './VisorRecuerdos.vue'

const props = defineProps({
  grupo: { type: String, required: true },
  lugar: { type: String, default: '' },
  invitacion: { type: String, default: 'Cuando lo vivamos, guarda aquí las fotos' },
})

const grupos = usarRecuerdos()
const fotos = computed(() => grupos[props.grupo] || [])
const quedan = computed(() => MAX_FOTOS - fotos.value.length)

// ---- Agregar: se pueden escoger varias y se editan una por una ----
const entrada = ref(null)
const fila = ref([])
const aviso = ref('')
let ultima = null
function escoger() { entrada.value?.click() }
function alEscoger(e) {
  const archivos = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
  e.target.value = ''
  if (archivos.length > quedan.value) avisar(`Caben ${MAX_FOTOS} fotos por bono. Tomé las primeras ${quedan.value}.`)
  ultima = null
  fila.value = archivos.slice(0, quedan.value)
}
async function alGuardar(datos) {
  try {
    ultima = (await guardarFoto(props.grupo, datos)).id
    navigator.vibrate?.(25)
  } catch {
    avisar('No se pudo guardar la foto. ¿Tienes espacio en el celular?')
  }
  siguiente()
}
// Al terminar la fila, abre la última foto guardada para ofrecer mandársela a Joan
function siguiente() {
  fila.value = fila.value.slice(1)
  if (!fila.value.length && ultima) abrir(ultima, true)
}
let tAviso
function avisar(t) {
  aviso.value = t
  clearTimeout(tAviso)
  tAviso = setTimeout(() => (aviso.value = ''), 5000)
}

// ---- Visor ----
const visor = ref(null) // { id, nueva }
function abrir(id, nueva = false) { visor.value = { id, nueva } }
</script>

<template>
  <section class="rc">
    <header class="rc__cabeza">
      <h4 class="rc__titulo">Recuerdos</h4>
      <span v-if="fotos.length" class="rc__cuenta">{{ fotos.length }} / {{ MAX_FOTOS }}</span>
    </header>

    <ul v-if="fotos.length" class="rc__grilla">
      <li v-for="f in fotos" :key="f.id">
        <button type="button" class="rc__mini" :aria-label="f.texto || 'Ver foto'" @click="abrir(f.id)">
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
      @saltar="siguiente"
      @cerrar="fila = []"
    />

    <VisorRecuerdos
      v-if="visor && fotos.length"
      :key="visor.id"
      :fotos="fotos"
      :inicial="visor.id"
      :etiqueta="() => lugar"
      :recien-guardada="visor.nueva"
      @cerrar="visor = null"
    />
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

</style>
