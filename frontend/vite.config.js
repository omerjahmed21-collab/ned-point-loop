import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The React dev server forwards /api and /admin to Django (port 8000),
// so the browser only ever talks to one address. This also means one
// ngrok tunnel is enough to test on a phone.
const backend = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': backend,
      '/admin': backend,
      '/static': backend,
      '/media': backend,
    },
  },
})
