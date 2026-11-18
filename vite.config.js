import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' para que funcione igual en Netlify, Vercel o GitHub Pages
// Puerto fijo 5176 (dev y preview). strictPort: si está ocupado, falla en vez de cambiar de puerto.
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: { port: 5176, strictPort: true, host: true },
  preview: { port: 5176, strictPort: true, host: true },
})
