import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Smart Hostel Vite Configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5143,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
