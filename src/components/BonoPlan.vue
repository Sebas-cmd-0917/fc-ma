<script setup>
import { computed, ref } from 'vue'
import { dos } from '../composables/tiempo.js'
import { vAparece } from '../composables/vAparece.js'
import PortadaLugar from './PortadaLugar.vue'
import Corona from './Corona.vue'

const props = defineProps({
  plan: { type: Object, required: true },
  indice: { type: Number, required: true },
  lado: { type: String, default: 'izq' },
  canjeado: { type: Boolean, default: false },
  agotado: { type: Boolean, default: false },
  max: { type: Number, default: 5 },
  nombre: { type: String, required: true },
  whatsapp: { type: String, default: '' },
  vigencia: { type: String, default: '' },
})
const emit = defineEmits(['canjear'])

const enlace = computed(() => {
  const texto = `🎟️ Quiero canjear mi bono N.º ${dos(props.indice)}: ${props.plan.lugar}\n${props.plan.plan}\n\n— ${props.nombre} 💜`
  const base = props.whatsapp ? `https://wa.me/${props.whatsapp}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(texto)}`
})

// Primer toque pide confirmación (son solo unos pocos bonos); el segundo canjea.
const confirmando = ref(false)
let espera
function canjear() {
  if (props.agotado) return
  if (!confirmando.value) {
    confirmando.value = true
    clearTimeout(espera)
    espera = setTimeout(() => (confirmando.value = false), 4000)
    return
  }
  clearTimeout(espera)
  confirmando.value = false
  emit('canjear', props.plan.id)
  navigator.vibrate?.([20, 30, 40])
  window.open(enlace.value, '_blank', 'noopener')
}
</script>

<template>
  <li class="bp" :class="[`bp--${lado}`, { 'bp--canjeado': canjeado, 'bp--agotado': agotado, 'bp--especial': plan.especial }]" v-aparece>
    <p class="bp__num" aria-hidden="true">
      <span class="bp__n">{{ dos(indice) }}</span>
      <span class="bp__tipo">{{ plan.especial ? 'viaje' : 'bono' }}</span>
    </p>

    <article class="bp__cuerpo">
      <span v-if="canjeado" class="bp__sello">Canjeado ✨</span>

      <figure class="bp__foto">
        <img v-if="plan.foto" :src="plan.foto" :alt="plan.lugar" loading="lazy" decoding="async" width="600" height="750" />
        <PortadaLugar v-else :escena="plan.escena" :lugar="plan.lugar" />
        <figcaption>{{ plan.lugar }}</figcaption>
        <small v-if="plan.credito" class="bp__credito">Foto: {{ plan.credito }} · Wikimedia Commons</small>
      </figure>

      <div class="bp__texto">
        <p class="bp__etiqueta">
          <Corona :size="18" class="bp__corona" />
          {{ plan.etiqueta || (plan.especial ? 'Viaje especial · si el tiempo nos deja' : 'Válido por un plan contigo') }}
        </p>
        <h3 class="bp__titulo">{{ plan.titulo }}</h3>
        <p class="bp__halago">“{{ plan.halago }}”</p>

        <div class="bp__plan">
          <small>El plan</small>
          <p>{{ plan.plan }}</p>
          <ul v-if="plan.detalles?.length">
            <li v-for="d in plan.detalles" :key="d">{{ d }}</li>
          </ul>
        </div>

        <div class="bp__corte" aria-hidden="true" />

        <p v-if="agotado" class="bp__agotado">Ya escogiste tus {{ max }} bonos ✨</p>
        <button v-else-if="!canjeado" type="button" class="bp__boton" :class="{ 'bp__boton--confirmar': confirmando }" @click="canjear">
          {{ confirmando ? '¿Segura? Toca otra vez para canjear' : 'Canjear este bono' }}
        </button>
        <a v-else class="bp__reenviar" :href="enlace" target="_blank" rel="noopener">Ya lo canjeaste · volver a avisarle</a>
        <p class="bp__vigencia">Válido {{ vigencia }} · tú escoges el día</p>
      </div>
    </article>
  </li>
</template>

<style scoped>
.bp {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}

.bp__num {
  grid-row: 1;
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: .35rem;
  margin: 0 0 -1.6rem;
  pointer-events: none;
}
.bp__n {
  font: 900 clamp(4rem, 22vw, 6.2rem)/.8 var(--f-display);
  letter-spacing: -.05em;
  color: var(--rosa-fuerte);
}
.bp__tipo { font: 400 2.1rem/1 var(--f-script); color: var(--violeta); }
.bp--izq .bp__num { grid-column: 1 / 5; }
.bp--der .bp__num { grid-column: 3 / -1; justify-self: end; flex-direction: row-reverse; }

.bp__cuerpo {
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem 0;
  padding: 2.2rem .9rem 1.2rem;
  background:
    radial-gradient(90% 50% at 100% 0%, rgba(244, 198, 228, .45), transparent 70%),
    var(--fondo-2);
  border: 1px solid rgba(124, 77, 216, .16);
  box-shadow: 0 18px 40px -24px rgba(124, 77, 216, .45);
}
.bp--izq .bp__cuerpo { grid-column: 1 / 6; border-radius: 6px 30px 30px 30px; transform: rotate(-1.2deg); }
.bp--der .bp__cuerpo { grid-column: 2 / -1; border-radius: 30px 6px 30px 30px; transform: rotate(1.2deg); }
.bp--especial .bp__cuerpo { border: 1.5px dashed rgba(226, 184, 102, .8); }
.bp--canjeado .bp__cuerpo { box-shadow: 0 0 0 4px rgba(199, 176, 245, .45), 0 18px 40px -24px rgba(124, 77, 216, .45); }

.bp__sello {
  position: absolute;
  z-index: 3;
  top: 27%;
  left: 50%;
  translate: -50% -50%;
  rotate: -14deg;
  padding: .4rem 1rem;
  border: 3px solid var(--violeta);
  border-radius: 10px;
  color: var(--violeta);
  background: rgba(253, 249, 255, .85);
  font: 900 1.4rem var(--f-display);
  letter-spacing: .04em;
  text-transform: uppercase;
}

.bp__foto {
  margin: 0;
  padding: .55rem .55rem .6rem;
  background: var(--fondo-2);
  border-radius: 3px;
  box-shadow: 0 14px 30px -14px rgba(58, 29, 104, .35);
}
.bp--izq .bp__foto { grid-column: 1 / 6; transform: rotate(2.4deg) translateX(-.2rem); }
.bp--der .bp__foto { grid-column: 2 / -1; transform: rotate(-2.4deg) translateX(.2rem); }
.bp__foto img, .bp__foto :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 2px;
}
.bp--canjeado .bp__foto img { filter: saturate(.6); }
.bp__foto figcaption {
  margin-top: .45rem;
  text-align: center;
  font: 400 1.6rem/1.1 var(--f-script);
  color: var(--violeta);
}
.bp__credito {
  display: block;
  margin-top: .15rem;
  text-align: center;
  font-size: .58rem;
  color: var(--texto-suave);
  opacity: .75;
}

.bp__texto { grid-column: 1 / -1; padding: 0 .5rem; }
.bp__etiqueta {
  display: flex;
  align-items: center;
  gap: .4rem;
  margin: .3rem 0 0;
  font-size: .7rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--violeta);
}
.bp__corona { filter: none; }
.bp__titulo { margin: .3rem 0 .5rem; font: 700 1.75rem/1.05 var(--f-display); letter-spacing: -.01em; }
.bp__halago { margin: 0 0 1.1rem; font: italic 400 1.125rem/1.45 var(--f-display); color: var(--texto-suave); }
.bp__plan {
  padding: .85rem 1rem;
  border-radius: 4px 18px 18px 18px;
  background: var(--fondo-3);
  font-weight: 500;
}
.bp__plan small { display: block; font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--rosa-fuerte); }
.bp__plan p { margin: 0; }
.bp__plan ul { margin: .5rem 0 0; padding-left: 1.1rem; font-weight: 400; }
.bp__plan li { margin: .2rem 0; }
.bp__plan li::marker { color: var(--rosa-fuerte); }

.bp__corte { height: 0; margin: 1.2rem -1.4rem 1rem; border-top: 2px dashed rgba(124, 77, 216, .25); }
.bp__boton {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 26px 6px 26px 26px;
  background: var(--brillo);
  color: var(--fondo-2);
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 12px 26px -14px rgba(124, 77, 216, .8);
  cursor: pointer;
  transition: transform .2s var(--ease);
}
.bp__boton:active { transform: scale(.97); }
.bp__boton--confirmar { background: var(--rosa-fuerte); font-size: .92rem; }
.bp--agotado .bp__cuerpo { opacity: .62; }
.bp--agotado .bp__foto img { filter: grayscale(.5); }
.bp__agotado {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  margin: 0;
  border: 1.5px dashed rgba(124, 77, 216, .35);
  border-radius: 26px 6px 26px 26px;
  color: var(--violeta);
  font-weight: 700;
  font-size: .9rem;
}
.bp__reenviar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  color: var(--violeta);
  font-weight: 700;
  font-size: .9rem;
}
.bp__vigencia { margin: .6rem 0 0; text-align: center; font-size: .75rem; color: var(--texto-suave); }
</style>
