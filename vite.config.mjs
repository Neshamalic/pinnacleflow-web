// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  build: {
    outDir: 'build',           // <- válido, pero configura "Output Directory = build" en Vercel
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4028,
    strictPort: true,
  },
})
