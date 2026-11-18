<script setup>
import { ref, nextTick } from 'vue'
import Corona from './Corona.vue'

const props = defineProps({
  nombre: { type: String, required: true },
  nacimiento: { type: Object, required: true },
})
const emit = defineEmits(['abrir'])

const dia = ref('')
const mes = ref('')
const anio = ref('')
const error = ref('')
const tiembla = ref(false)
const abriendo = ref(false)
const rDia = ref(null)
const rMes = ref(null)
const rAnio = ref(null)
const campos = { dia, mes, anio }
const inputs = { dia: rDia, mes: rMes, anio: rAnio }

function soloNumeros(nombre, max, siguiente) {
  const campo = campos[nombre]
  campo.value = campo.value.replace(/\D/g, '').slice(0, max)
  error.value = ''
  if (campo.value.length === max && siguiente) inputs[siguiente].value?.focus()
}

function verificar() {
  const n = props.nacimiento
  let a = +anio.value
  if (anio.value.length === 2) a += 2000
  if (+dia.value === n.dia && +mes.value === n.mes && a === n.anio) {
    abriendo.value = true
    navigator.vibrate?.([30, 40, 60])
    setTimeout(() => emit('abrir'), 900)
  } else {
    error.value = dia.value && mes.value && anio.value ? 'Mmm… esa no es 🙈 Intenta otra vez' : 'Completa día, mes y año'
    tiembla.value = false
    nextTick(() => (tiembla.value = true))
  }
}
</script>

<template>
  <section class="clave" :class="{ abriendo }">
    <div class="sobre" aria-hidden="true">
      <span class="sobre__solapa" />
      <span class="sobre__sello"><Corona :size="26" /></span>
    </div>

    <p class="clave__kicker">Llegó el día, {{ nombre }}</p>
    <h1 class="clave__titulo">Tienes una<br /><em>carta</em></h1>
    <p class="clave__texto">Para abrirla, escribe tu fecha de nacimiento.</p>

    <form class="clave__form" :class="{ tiembla }" @submit.prevent="verificar" @animationend="tiembla = false">
      <label class="campo">
        <input ref="rDia" v-model="dia" inputmode="numeric" autocomplete="off" placeholder="DD" maxlength="2"
          @input="soloNumeros('dia', 2, 'mes')" aria-label="Día" />
        <small>día</small>
      </label>
      <span class="barra" aria-hidden="true">/</span>
      <label class="campo">
        <input ref="rMes" v-model="mes" inputmode="numeric" autocomplete="off" placeholder="MM" maxlength="2"
          @input="soloNumeros('mes', 2, 'anio')" aria-label="Mes" />
        <small>mes</small>
      </label>
      <span class="barra" aria-hidden="true">/</span>
      <label class="campo campo--anio">
        <input ref="rAnio" v-model="anio" inputmode="numeric" autocomplete="off" placeholder="AAAA" maxlength="4"
          @input="soloNumeros('anio', 4, null)" aria-label="Año" />
        <small>año</small>
      </label>

      <button type="submit" class="clave__boton">Abrir mi carta</button>
      <p class="clave__error" aria-live="polite">{{ error }}</p>
    </form>
  </section>
</template>

<style scoped>
.clave {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-content: center;
  row-gap: 1rem;
  padding: calc(2rem + env(safe-area-inset-top)) var(--gutter) calc(2rem + env(safe-area-inset-bottom));
  transition: opacity .8s var(--ease), transform .8s var(--ease);
}
.clave.abriendo { opacity: 0; transform: translateY(-30px) scale(.98); }

.sobre {
  grid-column: 3 / -1;
  justify-self: end;
  position: relative;
  width: 150px;
  aspect-ratio: 3 / 2;
  margin-bottom: 1rem;
  background: linear-gradient(160deg, var(--fondo-2), var(--lila));
  border-radius: 10px;
  box-shadow: 0 22px 40px -20px rgba(138, 99, 201, .55);
  transform: rotate(6deg);
  animation: balancea 4s ease-in-out infinite;
}
.sobre__solapa {
  position: absolute;
  inset: 0 0 35% 0;
  background: linear-gradient(180deg, #a98af0, #d9c9fb);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  border-radius: 10px 10px 0 0;
  transform-origin: top;
  transition: transform .7s var(--ease);
}
.abriendo .sobre__solapa { transform: rotateX(180deg); }
.sobre__sello {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -40%;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--brillo);
  color: var(--fondo-2);
  box-shadow: 0 0 0 4px rgba(224, 122, 171, .25);
}

.clave__kicker {
  grid-column: 1 / -1;
  margin: 0;
  font-size: .78rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--violeta);
}
.clave__titulo {
  grid-column: 1 / -1;
  margin: 0;
  font: 900 clamp(3rem, 15vw, 4.4rem)/.92 var(--f-display);
  letter-spacing: -.03em;
}
.clave__titulo em { display: inline-block; margin-top: .1em; font: 400 1.35em/1 var(--f-script); color: var(--rosa-fuerte); padding-left: 1em; }
.clave__texto { grid-column: 1 / 6; margin: 0 0 .5rem; color: var(--texto-suave); }

.clave__form {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1.5fr;
  align-items: start;
  gap: .4rem;
}
.campo { display: grid; justify-items: center; gap: .3rem; }
.campo input {
  width: 100%;
  min-height: 60px;
  border: 1.5px solid var(--lila);
  border-radius: 18px 4px 18px 18px;
  background: var(--fondo-2);
  color: var(--texto);
  font: 700 1.6rem var(--f-display);
  text-align: center;
  font-variant-numeric: tabular-nums;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.campo input::placeholder { color: #c9bcd9; font-weight: 400; font-size: 1.1rem; }
.campo input:focus { border-color: var(--violeta); box-shadow: 0 0 0 4px rgba(138, 99, 201, .15); }
.campo small { font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--texto-suave); }
.barra { padding-top: 1rem; font: 400 1.6rem var(--f-display); color: var(--lila); }

.clave__boton {
  grid-column: 1 / -1;
  margin-top: 1rem;
  min-height: 56px;
  border: 0;
  border-radius: 28px 6px 28px 28px;
  background: var(--brillo);
  color: var(--fondo-2);
  font-weight: 700;
  font-size: 1.05rem;
  box-shadow: 0 14px 30px -14px rgba(138, 99, 201, .8);
  cursor: pointer;
  transition: transform .2s var(--ease);
}
.clave__boton:active { transform: scale(.97); }
.clave__error {
  grid-column: 1 / -1;
  min-height: 1.5em;
  margin: .25rem 0 0;
  text-align: center;
  font: italic 400 1rem var(--f-display);
  color: var(--rosa-fuerte);
}
.tiembla { animation: tiembla .45s var(--ease); }

@keyframes balancea { 50% { transform: rotate(2deg) translateY(-6px); } }
@keyframes tiembla {
  20% { transform: translateX(-8px); }
  40% { transform: translateX(7px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(2px); }
}
</style>
