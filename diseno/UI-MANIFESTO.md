---
name: ui-manifesto
description: Reglas visuales del proyecto (paleta, tipografía, movimiento, tono). Úsala antes de crear o modificar cualquier componente, estilo o texto visible de la app de cumpleaños.
---

# UI-MANIFESTO

Esta app es un regalo, no un producto. Cada pantalla debe sentirse hecha a mano para una sola persona.

## 1. Principios

1. **Íntimo antes que funcional.** Si hay que elegir entre "eficiente" y "cálido", gana cálido.
2. **Cero plantilla.** Nada de cards blancas con sombra gris, navbar azul, botones de Bootstrap ni íconos genéricos en círculos. Si un componente se parece a un dashboard, rehacerlo.
3. **Una idea por pantalla.** El hero dice "feliz cumpleaños". Una tarjeta dice un plan. No mezclar.
4. **El misterio es parte del regalo.** Lo bloqueado debe dar ganas de esperar, no frustrar.

## 2. Paleta (tokens en `src/style.css`)

Paleta "princesita": lavanda, lila y violeta, con toques de rosa y dorado de corona.

| Token | Uso |
|---|---|
| `--fondo` `#f3eaff` | Fondo base lavanda (con destellos blancos y dorados) |
| `--fondo-2` `#fdf9ff` | Tarjetas y marcos de foto |
| `--fondo-3` `#e8dcfc` | Lila claro: rellenos suaves |
| `--texto` `#3a1d68` | Texto principal (violeta real) |
| `--texto-suave` `#6e5896` | Texto secundario |
| `--rosa-pastel` `#f4c6e4` | Halos y niebla |
| `--rosa-fuerte` `#b45fd6` | Orquídea: números gigantes y énfasis |
| `--lila` `#c7b0f5` | Bordes y degradados |
| `--violeta` `#7c4dd8` | Acento principal |
| `--oro` `#e2b866` | Solo coronas y destellos |
| `--brillo` | Degradado violeta → orquídea para botones y el nombre |

Toques de princesa: coronita dorada sobre el nombre, destellos de estrella de cuatro puntas, y letra cursiva `Great Vibes` (`--f-script`) para el nombre, "Feliz", saludos y firmas.

- Nunca blanco puro (`#fff`) ni negro puro (`#000`).
- Máximo dos acentos por pantalla.
- Contraste de texto mínimo 4.5:1 sobre `--fondo` (texto pequeño en `--texto` o `--violeta`; el rosa solo en tamaños grandes).
- Sombras teñidas de violeta, nunca grises.

## 3. Tipografía

- **Display:** `Fraunces` (serif con carácter, cursiva para énfasis). Titulares enormes: el nombre/"Feliz cumpleaños" ocupa al menos 40% del ancho visible.
- **Texto:** `DM Sans` 16–17px, interlineado 1.55.
- **Números de fecha:** Fraunces, tamaño gigante (`clamp(4rem, 22vw, 7rem)`), como elemento gráfico, no como dato.
- Escala con `clamp()`, nunca tamaños fijos para titulares.

## 4. Movimiento

- Entrada: fade + desplazamiento de 12–24px, `cubic-bezier(.2,.7,.2,1)`, 500–900ms, escalonado.
- Ambiental: un solo elemento animado en bucle por pantalla (brillos/confeti lento). Nada que distraiga de leer.
- Feedback táctil: tarjeta bloqueada tiembla suave al tocarla; desbloqueada se "abre".
- Respetar `prefers-reduced-motion`: desactivar bucles y transformaciones.

## 5. Tono de los textos

- Español de Colombia, cercano, tuteo.
- Los halagos son específicos (un recuerdo, un gesto suyo), nunca genéricos tipo "eres especial".
- Microcopias con personalidad: "Todavía no, curiosa ✨" en vez de "Contenido bloqueado".

## 6. Móvil primero (no negociable)

- Diseñar a 360–430px de ancho. Escritorio = la misma columna centrada (máx 480px) sobre fondo ambiental.
- Touch targets ≥ 44×44px.
- Sin scroll horizontal jamás (`overflow-x: clip` en el root).
- Respetar `env(safe-area-inset-*)` para notch y barra de gestos.
- Imágenes: WebP/JPG ≤ 200 KB, `loading="lazy"` salvo la primera, siempre con `width`/`height` o `aspect-ratio`.
