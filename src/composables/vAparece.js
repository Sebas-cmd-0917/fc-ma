// Directiva v-aparece: fade-in cuando el elemento entra en pantalla.
const obs = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          obs.unobserve(e.target)
        }
      }
    }, { threshold: 0.15 })
  : null

export const vAparece = {
  mounted(el) {
    el.classList.add('aparece')
    obs ? obs.observe(el) : el.classList.add('visible')
  },
  unmounted(el) { obs?.unobserve(el) },
}
