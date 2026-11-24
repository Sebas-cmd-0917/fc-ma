<script setup>
import { ref, computed } from 'vue'
import { vAparece } from '../composables/vAparece.js'
import RecuerdosBono from './RecuerdosBono.vue'

const props = defineProps({
  bono: { type: Object, required: true },
  nombre: { type: String, required: true },
  firma: { type: String, required: true },
  whatsapp: { type: String, default: '' },
})

const CLAVE = 'mari-deseo'
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null') } catch { return null } }
const guardado = ref(props.bono.deseoCanjeado ? { texto: props.bono.deseoCanjeado } : leer())
const deseo = ref(guardado.value?.texto || '')

const enlace = computed(() => {
  const texto = `🎁 ${props.bono.titulo} (${props.bono.codigo})\n\nMi deseo en Bucaramanga es:\n${deseo.value.trim()}\n\n— ${props.nombre}`
  const base = props.whatsapp ? `https://wa.me/${props.whatsapp}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(texto)}`
})

function canjear() {
  if (!deseo.value.trim()) return
  guardado.value = { texto: deseo.value.trim() }
  try { localStorage.setItem(CLAVE, JSON.stringify(guardado.value)) } catch {}
  window.open(enlace.value, '_blank', 'noopener')
}
</script>

<template>
  <section class="bono-zona">
    <p class="bono-zona__kicker" v-aparece>Tu regalo especial</p>

    <article class="bono" v-aparece>
      <div class="bono__cabeza">
        <span class="bono__sello">25</span>
        <div>
          <p class="bono__tipo">Válido por</p>
          <h2 class="bono__titulo">{{ bono.titulo }}</h2>
        </div>
      </div>

      <p class="bono__valido">{{ bono.valido }}</p>

      <div class="bono__corte" aria-hidden="true" />

      <template v-if="!guardado">
        <label class="bono__label" for="deseo">¿Qué es eso que quieres con muchas ganas?</label>
        <textarea id="deseo" v-model="deseo" rows="3" maxlength="300" placeholder="Escribe tu deseo aquí…" />
        <button type="button" class="bono__boton" :disabled="!deseo.trim()" @click="canjear">
          Canjear y enviárselo a {{ firma }}
        </button>
      </template>
      <div v-else class="bono__canjeado">
        <p class="bono__estado">Deseo canjeado ✨</p>
        <p class="bono__deseo">“{{ guardado.texto }}”</p>
        <a class="bono__reenviar" :href="enlace" target="_blank" rel="noopener">Volver a enviarlo</a>
        <RecuerdosBono grupo="deseo" lugar="Tu deseo" invitacion="Cuando se cumpla, guarda aquí las fotos" />
      </div>

      <dl class="bono__datos">
        <div><dt>Vigencia</dt><dd>{{ bono.vigencia }}</dd></div>
        <div><dt>Código</dt><dd>{{ bono.codigo }}</dd></div>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.bono-zona {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: clamp(3.5rem, 12vh, 6rem) var(--gutter) 0;
}
.bono-zona__kicker {
  grid-column: 2 / -1;
  justify-self: end;
  margin: 0 0 1.25rem;
  font-size: .75rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--violeta);
}
.bono {
  grid-column: 1 / -1;
  position: relative;
  padding: 1.6rem 1.4rem 1.3rem;
  border-radius: 30px 30px 30px 6px;
  background:
    radial-gradient(120% 80% at 100% 0%, rgba(244, 198, 228, .85), transparent 60%),
    radial-gradient(100% 80% at 0% 100%, rgba(167, 128, 240, .55), transparent 60%),
    var(--fondo-2);
  box-shadow: 0 30px 60px -28px rgba(138, 99, 201, .6);
  transform: rotate(1deg);
  overflow: hidden;
}
.bono::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1.5px dashed rgba(226, 184, 102, .7);
  border-radius: 24px 24px 24px 4px;
  pointer-events: none;
}
.bono__cabeza { display: flex; align-items: center; gap: 1rem; }
.bono__sello {
  flex: none;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50% 50% 50% 12px;
  background: var(--brillo);
  color: var(--fondo-2);
  font: 900 1.8rem var(--f-display);
  box-shadow: 0 0 0 3px rgba(226, 184, 102, .7);
  transform: rotate(-8deg);
}
.bono__tipo { margin: 0; font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--violeta); }
.bono__titulo { margin: .1rem 0 0; font: 900 1.85rem/1 var(--f-display); letter-spacing: -.02em; }
.bono__valido { margin: 1rem 0 0; font: italic 400 1.1rem/1.45 var(--f-display); color: var(--texto); }

.bono__corte {
  height: 0;
  margin: 1.25rem -1.4rem;
  border-top: 2px dashed rgba(138, 99, 201, .3);
}

.bono__label { display: block; margin-bottom: .5rem; font-weight: 700; font-size: .95rem; }
textarea {
  width: 100%;
  padding: .8rem 1rem;
  border: 1.5px solid var(--lila);
  border-radius: 16px 4px 16px 16px;
  background: rgba(255, 250, 253, .85);
  color: var(--texto);
  font: 400 1rem/1.5 var(--f-texto);
  resize: none;
  outline: none;
}
textarea:focus { border-color: var(--violeta); box-shadow: 0 0 0 4px rgba(138, 99, 201, .15); }
.bono__boton {
  width: 100%;
  min-height: 54px;
  margin-top: .8rem;
  border: 0;
  border-radius: 27px 6px 27px 27px;
  background: var(--brillo);
  color: var(--fondo-2);
  font-weight: 700;
  cursor: pointer;
}
.bono__boton:disabled { opacity: .45; cursor: default; }

.bono__estado { margin: 0; font-weight: 700; color: var(--violeta); }
.bono__deseo { margin: .4rem 0 .6rem; font: italic 400 1.25rem/1.4 var(--f-display); }
.bono__reenviar {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--rosa-fuerte);
  font-weight: 700;
  font-size: .9rem;
}

.bono__datos {
  display: flex;
  justify-content: space-between;
  margin: 1.2rem 0 0;
  font-size: .8rem;
}
.bono__datos dt { font-size: .65rem; letter-spacing: .18em; text-transform: uppercase; color: var(--texto-suave); }
.bono__datos dd { margin: .1rem 0 0; font-weight: 700; }
.bono__datos div:last-child { text-align: right; }
</style>
