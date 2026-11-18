<script setup>
import { vAparece } from '../composables/vAparece.js'

defineProps({
  parrafos: { type: Array, required: true },
  nombre: { type: String, required: true },
  firma: { type: String, required: true },
})
</script>

<template>
  <section id="carta" class="carta">
    <p class="carta__kicker" v-aparece>Una carta para ti</p>

    <article class="carta__papel" v-aparece>
      <p class="carta__saludo">Querida {{ nombre }},</p>
      <p v-for="(p, i) in parrafos" :key="i" class="carta__parrafo" :class="{ 'carta__parrafo--final': i === parrafos.length - 1 }">
        {{ p }}
      </p>
      <p class="carta__firma">Con cariño,<br /><span>{{ firma }}</span></p>
      <span class="carta__cinta" aria-hidden="true" />
    </article>
  </section>
</template>

<style scoped>
.carta {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: clamp(3rem, 10vh, 5rem) var(--gutter) 0;
}
.carta__kicker {
  grid-column: 1 / -1;
  margin: 0 0 1.25rem;
  font-size: .75rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--violeta);
}
.carta__papel {
  grid-column: 1 / -1;
  position: relative;
  margin: 0 -.25rem;
  padding: 2.4rem 1.5rem 2rem;
  background:
    repeating-linear-gradient(transparent 0 31px, rgba(167, 128, 240, .22) 31px 32px),
    var(--fondo-2);
  background-position: 0 1.9rem;
  border-radius: 6px 34px 6px 34px;
  box-shadow: 0 30px 60px -30px rgba(138, 99, 201, .45);
  transform: rotate(-.8deg);
}
.carta__cinta {
  position: absolute;
  top: -14px;
  right: 22%;
  width: 92px;
  height: 28px;
  background: rgba(199, 176, 245, .8);
  transform: rotate(5deg);
  border-radius: 3px;
}
.carta__saludo {
  margin: 0 0 1rem;
  font: 400 2.8rem/1.1 var(--f-script);
  color: var(--violeta);
}
.carta__parrafo {
  margin: 0 0 1rem;
  font: 400 1.125rem/1.75 var(--f-display);
  color: var(--texto);
  text-wrap: pretty;
}
.carta__parrafo:first-of-type::first-letter {
  float: left;
  margin: .1rem .5rem 0 0;
  font: 900 3.6rem/.8 var(--f-display);
  color: var(--violeta);
}
.carta__parrafo--final { font-style: italic; color: var(--violeta); }
.carta__firma {
  margin: 1.75rem 0 0;
  text-align: right;
  color: var(--texto-suave);
  font-size: .95rem;
}
.carta__firma span {
  font: 400 2.8rem var(--f-script);
  color: var(--rosa-fuerte);
}
</style>
