import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sharedDecksApi } from './vite-plugin-shared-decks.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sharedDecksApi()],
})
