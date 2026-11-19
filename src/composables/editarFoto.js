// Motor del editor de fotos: recorte 4:5, giro, zoom y filtros "princesita".
// Todo se hace en <canvas> píxel a píxel, así se ve igual en iPhone y Android.

export const ANCHO = 1080
export const ALTO = 1350 // 4:5, como las fotos de los bonos

// Cada filtro: saturación, contraste, brillo, tinte (multiplica RGB),
// realce (suma RGB) y viñeta (oscurece bordes, 0–1).
export const FILTROS = [
  { id: 'natural', nombre: 'Natural' },
  { id: 'lavanda', nombre: 'Lavanda', sat: 0.85, con: 1.02, bri: 6, tinte: [0.98, 0.93, 1.06], realce: [10, 2, 22], vin: 0.18 },
  { id: 'rosa', nombre: 'Rosa', sat: 1.05, con: 1.0, bri: 8, tinte: [1.06, 0.95, 1.0], realce: [16, 0, 10], vin: 0.12 },
  { id: 'dorado', nombre: 'Dorado', sat: 1.12, con: 1.06, bri: 4, tinte: [1.08, 1.0, 0.86], realce: [10, 4, -4], vin: 0.22 },
  { id: 'sueno', nombre: 'Sueño', sat: 0.7, con: 0.86, bri: 16, tinte: [1.0, 0.97, 1.04], realce: [18, 12, 26], vin: 0 },
  { id: 'bn', nombre: 'B y N', sat: 0, con: 1.14, bri: 2, tinte: [1, 1, 1], realce: [0, 0, 0], vin: 0.25 },
]

// Carga el archivo y lo reduce a máx. 2048px (una foto de 12 MP haría
// lento el editor). El navegador ya aplica la orientación EXIF.
export async function cargarImagen(archivo) {
  const url = URL.createObjectURL(archivo)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    const max = 2048
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(img.naturalWidth * k)
    c.height = Math.round(img.naturalHeight * k)
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    return c
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Límite del desplazamiento (en fracción del lienzo) para que la foto
// siempre cubra todo el recorte.
export function limites(fuente, giro, zoom) {
  const [rw, rh] = giro % 180 ? [fuente.height, fuente.width] : [fuente.width, fuente.height]
  const escala = Math.max(ANCHO / rw, ALTO / rh) * zoom
  return {
    x: Math.max(0, (rw * escala - ANCHO) / 2 / ANCHO),
    y: Math.max(0, (rh * escala - ALTO) / 2 / ALTO),
  }
}

// Dibuja la foto en `lienzo` (cualquier tamaño 4:5) con el estado del editor.
export function pintar(lienzo, fuente, { giro, zoom, dx, dy, filtro }) {
  const W = lienzo.width
  const H = lienzo.height
  const ctx = lienzo.getContext('2d', { willReadFrequently: true })
  const [rw, rh] = giro % 180 ? [fuente.height, fuente.width] : [fuente.width, fuente.height]
  const escala = Math.max(W / rw, H / rh) * zoom
  ctx.save()
  ctx.fillStyle = '#fdf9ff'
  ctx.fillRect(0, 0, W, H)
  ctx.imageSmoothingQuality = 'high'
  ctx.translate(W / 2 + dx * W, H / 2 + dy * H)
  ctx.rotate((giro * Math.PI) / 180)
  ctx.scale(escala, escala)
  ctx.drawImage(fuente, -fuente.width / 2, -fuente.height / 2)
  ctx.restore()
  aplicarFiltro(ctx, W, H, FILTROS.find((f) => f.id === filtro))
}

function aplicarFiltro(ctx, W, H, f) {
  if (!f || f.id === 'natural') return
  const datos = ctx.getImageData(0, 0, W, H)
  const p = datos.data
  const { sat, con, bri, tinte, realce, vin } = f
  const cx = W / 2
  const cy = H / 2
  const radio2 = cx * cx + cy * cy
  for (let y = 0; y < H; y++) {
    const ddy = (y - cy) * (y - cy)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      let r = p[i], g = p[i + 1], b = p[i + 2]
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
      r = lum + (r - lum) * sat
      g = lum + (g - lum) * sat
      b = lum + (b - lum) * sat
      r = (r - 128) * con + 128 + bri
      g = (g - 128) * con + 128 + bri
      b = (b - 128) * con + 128 + bri
      r = r * tinte[0] + realce[0]
      g = g * tinte[1] + realce[1]
      b = b * tinte[2] + realce[2]
      if (vin) {
        const d = ((x - cx) * (x - cx) + ddy) / radio2 // 0 centro → 1 esquina
        const k = 1 - vin * d * d
        // viñeta teñida de violeta, nunca negra
        r = r * k + 58 * (1 - k)
        g = g * k + 29 * (1 - k)
        b = b * k + 104 * (1 - k)
      }
      p[i] = r < 0 ? 0 : r > 255 ? 255 : r
      p[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g
      p[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b
    }
  }
  ctx.putImageData(datos, 0, 0)
}

export function exportar(fuente, estado) {
  const c = document.createElement('canvas')
  c.width = ANCHO
  c.height = ALTO
  pintar(c, fuente, estado)
  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error('toBlob'))), 'image/jpeg', 0.86))
}
