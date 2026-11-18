import { ref, onMounted, onUnmounted } from 'vue'

export const ZONA_ITALIA = 'Europe/Rome'
export const ZONA_COLOMBIA = 'America/Bogota'

// Reloj reactivo que avanza cada segundo.
//
// Para PROBAR sin cambiar el reloj del celular, abre la app con:
//   ?ahora=2026-11-18T23:59:50+01:00   (10 s antes de la medianoche en Italia)
//   ?fecha=2026-12-12                  (ese día a mediodía, hora Colombia)
// El reloj simulado sigue corriendo desde ese momento.
export function useReloj() {
  const inicioSimulado = leerSimulado()
  const desfase = inicioSimulado ? inicioSimulado - Date.now() : 0
  const ahora = ref(new Date(Date.now() + desfase))
  let timer

  onMounted(() => {
    timer = setInterval(() => (ahora.value = new Date(Date.now() + desfase)), 1000)
  })
  onUnmounted(() => clearInterval(timer))

  return { ahora, simulado: !!inicioSimulado }
}

function leerSimulado() {
  const q = new URLSearchParams(location.search)
  let texto = q.get('ahora')
  if (!texto && q.get('fecha')) texto = `${q.get('fecha')}T12:00:00-05:00`
  if (!texto) return null
  const d = new Date(texto.replace(' ', '+')) // "+" en la URL llega como espacio
  return isNaN(d) ? null : d.getTime()
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Partes de una fecha vistas en una zona horaria concreta
export function enZona(fecha, zona) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zona,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      weekday: 'short', hourCycle: 'h23',
    })
      .formatToParts(new Date(fecha))
      .map((x) => [x.type, x.value]),
  )
  const hora = +p.hour % 24
  return {
    anio: +p.year, mes: +p.month, dia: +p.day,
    hora, minuto: +p.minute, segundo: +p.second,
    semana: DIAS[DIAS_EN.indexOf(p.weekday)],
    mesTexto: MESES[+p.month - 1],
    horaTexto: `${hora % 12 || 12}:${String(+p.minute).padStart(2, '0')} ${hora < 12 ? 'a. m.' : 'p. m.'}`,
  }
}

export function diasHasta(fecha, ahora, zona) {
  const a = enZona(ahora, zona)
  const b = enZona(fecha, zona)
  return Math.round((Date.UTC(b.anio, b.mes - 1, b.dia) - Date.UTC(a.anio, a.mes - 1, a.dia)) / 86_400_000)
}

export function desglose(ms) {
  const t = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }
}

export const dos = (n) => String(n).padStart(2, '0')
