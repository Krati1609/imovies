import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development, requests to /api are forwarded to the Express server,
// so the browser sees one origin and CORS is not a problem.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
