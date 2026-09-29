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
    //
    // DEV_API_PROXY låter er utveckla mot en REDAN DRIFTSATT backend utan att
    // köra en egen lokalt:
    //
    //   DEV_API_PROXY=https://dv1677-picard.nplab.bth.se npm run dev
    //
    // Varför ett eget namn i stället för VITE_API_URL? Vite plockar upp allt
    // som börjar med VITE_ ur miljön och bakar in det i klienten. Sätter ni
    // VITE_API_URL här blir api.js BASE_URL absolut, anropet går förbi proxyn
    // och ni får CORS-felet redan lokalt — alltså precis det proxyn finns för
    // att undvika. DEV_API_PROXY saknar prefix och når aldrig klienten.
    proxy: {
      '/api': {
        target: process.env.DEV_API_PROXY || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
