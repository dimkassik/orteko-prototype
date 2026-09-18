import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base — путь на GitHub Pages: https://dimkassik.github.io/orteko-prototype/
export default defineConfig({
  plugins: [react()],
  base: '/orteko-prototype/',
})
