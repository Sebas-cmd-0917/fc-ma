---
name: maquetar-unico
description: Cómo maquetar layouts asimétricos y no genéricos con CSS Grid en esta app. Úsala al crear o reorganizar la estructura (HTML/CSS) de cualquier vista o tarjeta.
---

# Maquetar único

Complementa a `ui-manifesto` (qué se ve) con el cómo se construye.

## Reglas de layout

1. **Rejilla editorial de 6 columnas** en móvil (`grid-template-columns: repeat(6, 1fr)`), no una pila de bloques al 100%. Los elementos se ubican con `grid-column` para crear tensión: un titular de 1/6, un texto de 2/7, una foto que se sale del margen.
2. **Asimetría alternada.** En listas (timeline), las tarjetas pares e impares cambian de lado: fecha gigante a la izquierda / a la derecha, leve rotación (±1.5deg), desplazamiento horizontal. Usar `:nth-child(even)` o una prop `lado`.
3. **Solapar con intención.** El número de fecha se monta sobre la foto o el borde de la tarjeta (`grid-area` compartida + `z-index`), nunca en una fila aparte tipo etiqueta.
4. **Romper el borde.** Al menos un elemento por vista toca o sangra fuera del contenedor (foto, línea del timeline, número).
5. **Espacio generoso y desigual.** Márgenes verticales grandes (`clamp(3rem, 12vh, 6rem)`) entre secciones; dentro de una tarjeta, espaciado ajustado. El contraste de densidades es lo que la hace sentir diseñada.
6. **Formas propias.** Bordes redondeados distintos por esquina (`border-radius: 28px 6px 28px 6px`), recortes con `clip-path`, marcos de foto tipo polaroid. Prohibido el `border-radius: 8px` uniforme + sombra gris.

## Reglas técnicas

- Flexbox solo para alinear dentro de un elemento; la composición de la vista va en Grid.
- Unidades: `rem` para tipografía, `clamp()` para tamaños fluidos, `dvh` en lugar de `vh` para pantallas completas en móvil.
- Contenedor raíz: `max-width: 480px; margin-inline: auto; overflow-x: clip;`.
- Nada de frameworks de UI (Bootstrap, Vuetify, etc.): producen el aspecto de plantilla que queremos evitar.
- Componentes Vue con `<style scoped>` y tokens de `src/style.css`; nunca colores sueltos en un componente.
- Antes de dar por terminado un layout, probarlo a 360px y 430px de ancho y confirmar que no hay scroll horizontal.

## Checklist rápido

- [ ] ¿Se parece a una plantilla? Si sí, rehacer.
- [ ] ¿Hay al menos un elemento que rompe la rejilla?
- [ ] ¿Las tarjetas alternan lado?
- [ ] ¿Touch targets ≥ 44px?
- [ ] ¿Funciona con `prefers-reduced-motion`?
