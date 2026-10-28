import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = nome do repositório, para funcionar no GitHub Pages (extreme500.github.io/subsTCCk/)
export default defineConfig({
  plugins: [react()],
  base: '/subsTCCk/',
})
