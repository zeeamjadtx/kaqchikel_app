import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiRoutes } from './vite-plugin-api.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiRoutes()],
})
