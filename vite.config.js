import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Docker API requests to Express backend
      '/api/docker': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy Gateway API requests (for development - replace with actual gateway URL)
      '/internal': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
