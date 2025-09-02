// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tagger from '@dhiwise/component-tagger'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 2000,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    tagger(),
  ],
  resolve: {
    alias: {
      // Con esto, "@/algo" apunta a "src/algo"
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 4028,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],
  },
})
