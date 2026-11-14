import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    // Built JS/CSS go to dist/static/, NOT dist/assets/ — keeps app code separate
    // from public/assets/ images so an image-folder cleanup can't break the app.
    assetsDir: 'static',
  },
})
