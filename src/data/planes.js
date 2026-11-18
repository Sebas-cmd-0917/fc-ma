// ============================================================
//  AQUÍ VA TODO EL CONTENIDO. Es lo único que tienes que editar.
// ============================================================
//
//  La fecha de apertura lleva su zona horaria (+01:00 = hora de Italia).
//
//  Fotos: ponlas en /public/fotos/ y escribe 'fotos/nombre.webp'
//  (JPG o WebP, máx. 1080px de ancho, < 200 KB).
//  Si una foto está vacía ('') se muestra una ilustración del lugar.
//  Las fotos de referencia son de Wikimedia Commons (licencias libres); el
//  campo `credito` muestra el autor, como piden esas licencias.

export const config = {
  nombre: 'Mari',
  nombreCompleto: 'Mariana',
  edad: 25,
  // La carta se abre a las 00:00 del 19 de noviembre, hora de Italia
  apertura: '2026-11-19T00:00:00+01:00',
  // Clave = su fecha de nacimiento (día, mes, año)
  nacimiento: { dia: 19, mes: 11, anio: 2001 },
  firma: 'Joan',
  // Tu vista privada: abre el link con ?vista=joan-corona25 para ver TODO
  // desbloqueado sin esperar. No le compartas esta parte del link a Mari.
  codigoJoan: 'joan-corona25',
  // Tu número de WhatsApp con indicativo y sin "+" (ej. '573001234567').
  // Si lo dejas vacío, WhatsApp le pedirá a ella escoger el contacto.
  whatsapp: '573013755133',
}

// La carta: cada elemento es un párrafo
export const carta = [
  'En el poco tiempo que tuvimos la oportunidad de hablar y compartir, conocí a una Mariana muy atenta, muy bonita, con un corazón enorme y unos sentimientos muy lindos. Cualidades que te hacían una mujer única, especial y con una luz propia que te hacía resplandecer.',
  'Sé que las personas cambian con el paso del tiempo, que vivimos experiencias que nos transforman y que quizás ya no somos exactamente los mismos de antes. Sin embargo, hay algo que siempre me ha parecido muy bonito de ti, y es que nunca he necesitado hablar demasiado contigo para sentir esa tranquilidad y esa confianza de poder contarte cualquier cosa, como si el tiempo no hubiera pasado y hubiéramos estado cerca todo este tiempo.',
  'Lamento haberme perdido durante tanto tiempo, sobre todo sabiendo la gran persona que eras y lo bonito que era tenerte en mi vida.',
  'Pero bueno, también creo que las coincidencias tienen algo especial. Hace poco me encontré pensando en ti, preguntándome: «¿Cómo estará Mariana? ¿Qué será de su vida?». Y que, de alguna manera, la vida nos haya dado la oportunidad de volver a coincidir me hizo muy feliz.',
  'Perdóname por haberme perdido tus últimos cumpleaños, por no haber estado presente para desearte cosas bonitas en esos días especiales. Pero espero que este año sea diferente y, si me lo permites, poder aportar aunque sea un poquito a que tengas un cumpleaños muy feliz, lleno de sonrisas, cariño y momentos que te recuerden lo especial que eres.',
  'Porque, aunque haya pasado el tiempo, hay personas que uno recuerda con muchísimo cariño, y tú, Mariana, siempre has sido una de ellas.',
]

export const bono = {
  titulo: 'Bono por un deseo',
  valido: 'Lo que más quieras hacer, probar o conocer en Bucaramanga. Tú lo pides y yo lo hago realidad.',
  vigencia: '10 dic 2026 – 14 ene 2027',
  codigo: 'MARI·25',
}

// Bonos de planes en Bucaramanga. No tienen fecha: ella escoge cuáles quiere
// (máximo `maxBonos`), los canjea (te llega por WhatsApp) y ustedes cuadran el día.
// El bono por un deseo de arriba es aparte y no cuenta en ese límite.
// Ella está del 10 de diciembre al 14 de enero.
// El orden en la app es el mismo de esta lista.
// `especial: true` = viaje más largo, "si el tiempo nos deja".
// `etiqueta` (opcional) cambia el texto pequeño de arriba del título.
export const vigenciaPlanes = '10 dic 2026 – 14 ene 2027'
export const maxBonos = 5

export const planes = [
  {
    id: 5,
    titulo: 'Entre pinos y nubes',
    lugar: 'Mesa de los Santos',
    halago: 'Tienes esa calma bonita que hace que todo alrededor se sienta en paz.',
    plan: 'Un día completo en la Mesa de los Santos.',
    detalles: ['Caminar por el bosque de pinos', 'Visitar el refugio de aves y animales', 'Café en Jarg Coffee'],
    foto: 'fotos/mesa-de-los-santos.webp',
    credito: 'Wilbermendex · CC BY-SA 4.0',
    escena: 'pinos',
  },
  {
    id: 1,
    titulo: 'Un café para volver a coincidir',
    lugar: 'Mokana Ancestral',
    halago: 'Hay conversaciones que se sienten como volver a casa, y contigo siempre ha sido así.',
    plan: 'Tarde de café y charla sin afán en Mokana.',
    detalles: [],
    foto: 'fotos/mokana.webp',
    escena: 'cafe',
  },
  {
    id: 2,
    titulo: 'La ciudad se enciende',
    lugar: 'Alumbrados del área metropolitana',
    halago: 'Ninguna luz de diciembre brilla como lo hace tu sonrisa.',
    plan: 'Recorrido nocturno por los alumbrados navideños de toda el área metropolitana.',
    detalles: ['Bucaramanga y Floridablanca', 'Girón y su centro colonial', 'Piedecuesta'],
    foto: 'fotos/alumbrados-bucaramanga.webp',
    credito: 'Ángel Páez · CC BY 4.0',
    escena: 'luces',
  },
  {
    id: 4,
    titulo: 'Antojo dulce',
    lugar: 'Guanabanazo · vía a Barranca',
    halago: 'Eres más dulce que cualquier postre, y eso ya es mucho decir.',
    plan: 'Ir por un guanabanazo 🍧🍨 al Guanabanazo, en la carretera Barranca – La Lisboa.',
    detalles: [],
    foto: 'fotos/lebrija.webp',
    credito: 'Romain Breget · CC BY-SA 3.0',
    escena: 'campo',
  },
  {
    id: 8,
    titulo: 'Año Nuevo en familia',
    lugar: 'Charalá',
    etiqueta: 'Semana del 31 de diciembre · si te animas',
    halago: 'Me haría muy feliz empezar el año compartiendo contigo.',
    plan: 'Pasar la semana del 31 con mi familia en Charalá y, de paso, pasear por el pueblito.',
    detalles: ['Recibir el Año Nuevo juntos', 'Caminar por el pueblo y su plaza'],
    foto: 'fotos/charala.webp',
    credito: 'Juan Pablo Rubiano · CC BY-SA 4.0',
    escena: 'pueblo',
    especial: true,
  },
  {
    id: 3,
    titulo: 'El pueblo más lindo',
    lugar: 'Barichara',
    halago: 'Te mereces lugares tan bonitos como tú.',
    plan: 'Escapada a Barichara: caminar sus calles empedradas y quedarnos para ver el alumbrado.',
    detalles: [],
    foto: 'fotos/barichara.webp',
    credito: 'Bernard Gagnon · CC BY-SA 4.0',
    escena: 'pueblo',
    especial: true,
  },
  {
    id: 6,
    titulo: 'Un viaje de luces',
    lugar: 'Medellín',
    halago: 'Contigo cualquier camino largo se hace corto.',
    plan: 'Ir a ver los alumbrados navideños de Medellín.',
    detalles: [],
    foto: 'fotos/medellin.webp',
    credito: 'laloking97 · CC BY-SA 2.0',
    escena: 'ciudad',
    especial: true,
  },

  // ── EL DESEO DE MARI ─────────────────────────────────────────
  // Cuando te llegue su deseo por WhatsApp, quita los // de este bloque,
  // llena los datos, corre `npm run build` y vuelve a subir `dist` a Netlify.
  // {
  //   id: 7,
  //   titulo: 'Tu deseo, cumplido',
  //   lugar: 'Lo que tú pediste',
  //   halago: 'Me pediste esto, y yo lo cumplo con todo el gusto.',
  //   plan: 'Aquí va su deseo',
  //   detalles: [],
  //   foto: '',
  //   escena: 'luces',
  // },
]
