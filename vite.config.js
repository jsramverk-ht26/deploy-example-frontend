import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // VIKTIGT för GitHub Pages:
  // Ett "project site" serveras från en underkatalog, inte från roten:
  //   https://<org>.github.io/deploy-example-frontend/
  //
  // Utan `base` bygger Vite länkar till /assets/... — men filerna ligger på
  // /deploy-example-frontend/assets/... Resultatet blir en vit sida och 404
  // på alla JS- och CSS-filer. Det är det i särklass vanligaste felet.
  //
  // Byt ut strängen mot ert eget reponamn (snedstreck i början OCH slutet).
  base: '/deploy-example-frontend/',

  server: {
    port: 5173,

    // Proxy används BARA under lokal utveckling (npm run dev).
    // Anrop till /api skickas vidare till backend, vilket gör att
    // webbläsaren ser dem som samma origin — därför slipper vi CORS lokalt.
    // I det byggda bygget på Pages finns ingen proxy: då går anropet direkt
    // till VITE_API_URL och backend MÅSTE skicka CORS-headers.
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
