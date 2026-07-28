import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'vendor-mui'
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
            if (id.includes('@tanstack')) return 'vendor-query'
            if (id.includes('firebase')) return 'vendor-firebase'
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
