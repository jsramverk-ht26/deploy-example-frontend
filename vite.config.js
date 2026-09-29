import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Configen är en funktion i stället för ett objekt för att vi ska kunna läsa
// .env-filen INNAN configen byggs. loadEnv med tomt prefix ('') läser ALLA
// variabler ur .env, inte bara de som börjar med VITE_.
//
// Det påverkar bara configen. Vad som exponeras för klienten styrs fortfarande
// av envPrefix (standard: VITE_), så DEV_API_PROXY når aldrig webbläsaren.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
      // Kör ni ingen backend lokalt kan ni peka proxyn på en driftsatt backend.
      // Två sätt, båda fungerar:
      //
      //   .env:          DEV_API_PROXY=https://dv1677-picard.nplab.bth.se
      //   kommandorad:   DEV_API_PROXY=https://... npm run dev
      //
      // Varför ett eget namn i stället för VITE_API_URL? Vite bakar in allt som
      // börjar med VITE_ i klienten. Sätter ni VITE_API_URL här blir BASE_URL i
      // api.js absolut, anropet går förbi proxyn och ni får CORS-felet redan
      // lokalt — alltså precis det proxyn finns för att undvika.
      proxy: {
        '/api': {
          target: env.DEV_API_PROXY || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
})
