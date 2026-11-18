# Cumple M · calendario de planes

Web móvil (Vue 3 + Vite) para su cumpleaños del 19 de noviembre. Hero de felicitación + timeline de planes que se desbloquean según la fecha del celular.

## Correr en tu Mac
```bash
npm install
npm run dev        # abre la URL "Network" en tu celular (misma Wi-Fi)
```

## Cómo funciona
1. **Cuenta regresiva** en hora de Italia hasta las 00:00 del 19 de noviembre (Europe/Rome).
2. **Clave**: se abre con su fecha de nacimiento (19 / 11 / 2001). Una vez abierta, el celular la recuerda.
3. **Carta de Joan** y **bono por un deseo** (ella escribe su deseo y se envía por WhatsApp).
4. **Bonos de planes** sin fecha: ella escoge cuál quiere, toca "Canjear este bono" y te llega un WhatsApp. El bono queda marcado como canjeado en su celular.

## Lo único que tienes que editar
`src/data/planes.js`: textos, bonos, clave y tu WhatsApp (`config.whatsapp`). El orden de los bonos es el de la lista.
Fotos en `public/fotos/` y en el plan escribe `foto: 'fotos/lugar.webp'` (JPG/WebP, máx. 1080px, < 200 KB). Sin foto se muestra una ilustración.

## Vista privada de Joan (todo desbloqueado)
Agrega `?vista=joan-corona25` al final del link:
- En tu Mac: `http://localhost:5176/?vista=joan-corona25`
- Publicada: `https://TU-LINK.netlify.app/?vista=joan-corona25`
Salta la cuenta regresiva y la clave, y abre todos los planes. No guarda nada. A Mari mándale el link sin esa parte.

## Probar la cuenta regresiva
- `?ahora=2026-11-18T23:59:50%2B01:00` → 10 segundos antes de medianoche en Italia (luego pide la clave)

## Publicar
```bash
npm run build      # genera dist/
```
- **Netlify Drop:** arrastra la carpeta `dist/` a https://app.netlify.com/drop
- **Vercel:** `npx vercel --prod`
- **GitHub Pages:** sube `dist/` (ya usa rutas relativas).

## Diseño
Reglas en `diseno/UI-MANIFESTO.md` y `diseno/maquetar-unico.md`. Para que Claude Code las cargue solas como skills en este proyecto, ejecuta una vez en esta carpeta:

```bash
mkdir -p .claude/skills/ui-manifesto .claude/skills/maquetar-unico
cp diseno/UI-MANIFESTO.md .claude/skills/ui-manifesto/SKILL.md
cp diseno/maquetar-unico.md .claude/skills/maquetar-unico/SKILL.md
```

Nota: el bloqueo es del lado del cliente; alguien que cambie la fecha del celular o lea el código puede ver los planes antes.
