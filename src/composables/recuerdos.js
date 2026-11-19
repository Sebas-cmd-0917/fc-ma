// Recuerdos: fotos que Mari guarda en cada bono, en SU celular (IndexedDB).
//
// - Las fotos no salen del celular: no hay servidor. Si borra los datos del
//   navegador o cambia de celular, se pierden. Por eso el visor tiene
//   "Compartir" y "Guardar en el celular".
// - En la vista de Joan (?vista=…) o en modo prueba (?ahora= / ?fecha=) se usa
//   otra base de datos, para que las pruebas no se mezclen con nada real.
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

// Estado reactivo compartido: grupo → lista de fotos (más vieja primero)
const grupos = reactive({})
const cargando = new Set()

function conUrl(f) {
  return { ...f, url: URL.createObjectURL(f.blob) }
}

export function usarRecuerdos(grupo) {
  if (!grupos[grupo] && !cargando.has(grupo)) {
    cargando.add(grupo)
    grupos[grupo] = []
    tx('readonly', (s) => s.index('grupo').getAll(grupo))
      .then((lista) => {
        grupos[grupo] = lista.sort((a, b) => a.creada - b.creada).map(conUrl)
      })
      .catch(() => {})
  }
  return grupos
}

export async function guardarFoto(grupo, { blob, texto, filtro }) {
  const foto = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    grupo,
    blob,
    texto: texto.trim(),
    filtro,
    creada: Date.now(),
  }
  await tx('readwrite', (s) => s.put(foto))
  grupos[grupo] = [...(grupos[grupo] || []), conUrl(foto)]
  return foto
}

export async function cambiarTexto(grupo, id, texto) {
  const f = grupos[grupo]?.find((x) => x.id === id)
  if (!f) return
  const { url, ...guardable } = f
  guardable.texto = texto.trim()
  await tx('readwrite', (s) => s.put(guardable))
  grupos[grupo] = grupos[grupo].map((x) => (x.id === id ? { ...x, texto: guardable.texto } : x))
}

export async function borrarFoto(grupo, id) {
  await tx('readwrite', (s) => s.delete(id))
  const f = grupos[grupo]?.find((x) => x.id === id)
  if (f) URL.revokeObjectURL(f.url)
  grupos[grupo] = (grupos[grupo] || []).filter((x) => x.id !== id)
}
