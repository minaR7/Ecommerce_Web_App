import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'

// Down-level Tailwind v4's modern CSS (oklch(), color-mix(), etc.) to sRGB
// fallbacks so the site renders correctly on Safari 15.1 and other older browsers.
// Targets come from the "browserslist" field in package.json.
const targets = browserslistToTargets(browserslist())

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets },
  },
  build: {
    cssMinify: 'lightningcss',
    // antd and Stripe are single large third-party libraries that can't be
    // split further and only load on the pages that use them (antd = UI core,
    // Stripe = checkout only). Raise the limit so the warning reflects real
    // app code, not irreducible vendor weight.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into their own cacheable chunks
          // so the main app bundle stays small.
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          stripe: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        },
      },
    },
  },
})
