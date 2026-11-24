// Recuerdos: fotos que Mari guarda en cada bono, en SU celular (IndexedDB).
//
// - Las fotos no salen del celular: no hay servidor. Si borra los datos del
//   navegador o cambia de celular, se pierden. Por eso el visor tiene el botón
//   "Mandársela a Joan" (WhatsApp) y "Guardar en el celular".
// - En la vista de Joan (?vista=…) o en modo prueba (?ahora= / ?fecha=) se usa
//   otra base de datos, para que las pruebas no se mezclen con nada real.
// - Cada foto tiene un `dia` (AAAA-MM-DD) que ella escoge al guardarla; con eso
//   se arma el calendario de recuerdos.
import { reactive } from 'vue'
import { config } from '../data/planes.js'

const q = new URLSearchParams(location.search)
const deprueba = q.get('vista') === config.codigoJoan || q.has('ahora') || q.has('fecha')
const NOMBRE_DB = deprueba ? 'mari-recuerdos-prueba' : 'mari-recuerdos'
export const MAX_FOTOS = 9

let dbPromesa
function abrir() {
  if (!dbPromesa) {
    dbPromesa = new Promise((ok, mal) => {
      if (typeof indexedDB === 'undefined') return mal(new Error('sin indexedDB'))
      const pet = indexedDB.open(NOMBRE_DB, 1)
      pet.onupgradeneeded = () => {
        const tienda = pet.result.createObjectStore('fotos', { keyPath: 'id' })
        tienda.createIndex('grupo', 'grupo')
      }
      pet.onsuccess = () => ok(pet.result)
      pet.onerror = () => mal(pet.error)
    })
    // Pide al navegador no borrar estos datos cuando le falte espacio
    navigator.storage?.persist?.().catch(() => {})
  }
  return dbPromesa
}

function tx(modo, fn) {
  return abrir().then((db) => new Promise((ok, mal) => {
    const t = db.transaction('fotos', modo)
    const res = fn(t.objectStore('fotos'))
    t.oncomplete = () => ok(res?.result ?? res)
    t.onerror = () => mal(t.error)
    t.onabort = () => mal(t.error)
  }))
}

// Fecha local de hoy en formato AAAA-MM-DD
export function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function diaDe(ms) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Estado reactivo compartido: grupo → lista de fotos (por día y hora)
const grupos = reactive({})
const ordenar = (lista) => lista.sort((a, b) => (a.dia === b.dia ? a.creada - b.creada : a.dia < b.dia ? -1 : 1))
const conUrl = (f) => ({ ...f, dia: f.dia || diaDe(f.creada), url: URL.createObjectURL(f.blob) })

let carga
function cargarTodo() {
  if (!carga) {
    carga = tx('readonly', (s) => s.getAll())
      .then((lista) => {
        const nuevos = {}
        for (const f of lista) (nuevos[f.grupo] ||= []).push(conUrl(f))
        for (const g in nuevos) grupos[g] = ordenar(nuevos[g])
      })
      .catch(() => {})
  }
  return carga
}

export function usarRecuerdos() {
  cargarTodo()
  return grupos
}

export async function guardarFoto(grupo, { blob, texto, filtro, dia }) {
  const foto = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    grupo,
    blob,
    texto: texto.trim(),
    filtro,
    dia: dia || hoy(),
    creada: Date.now(),
  }
  await tx('readwrite', (s) => s.put(foto))
  await cargarTodo()
  const lista = conUrl(foto)
  grupos[grupo] = ordenar([...(grupos[grupo] || []), lista])
  return lista
}

export async function cambiarFoto(grupo, id, cambios) {
  const f = grupos[grupo]?.find((x) => x.id === id)
  if (!f) return
  const { url, ...guardable } = { ...f, ...cambios }
  if (typeof guardable.texto === 'string') guardable.texto = guardable.texto.trim()
  await tx('readwrite', (s) => s.put(guardable))
  grupos[grupo] = ordenar(grupos[grupo].map((x) => (x.id === id ? { ...guardable, url } : x)))
}

export async function borrarFoto(grupo, id) {
  await tx('readwrite', (s) => s.delete(id))
  const f = grupos[grupo]?.find((x) => x.id === id)
  if (f) URL.revokeObjectURL(f.url)
  grupos[grupo] = (grupos[grupo] || []).filter((x) => x.id !== id)
}
