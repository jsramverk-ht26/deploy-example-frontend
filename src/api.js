// Bas-URL till backend-API:t.
//
// Två lägen:
//
//   Lokalt (npm run dev)  — VITE_API_URL är tom. Vi anropar '/api/...' relativt,
//                           och Vites proxy (se vite.config.js) skickar vidare
//                           till http://localhost:3000. Samma origin => ingen CORS.
//
//   Byggt (GitHub Pages)  — VITE_API_URL sätts vid BYGGET av deploy.yml och
//                           pekar på den driftsatta backenden. Anropet går då
//                           över till en annan domän => backend måste svara
//                           med CORS-headers.
//
// OBS: import.meta.env.VITE_* läses vid byggtillfället och bakas in i den
// färdiga JS-filen. Värdet är därmed PUBLIKT — lägg aldrig lösenord eller
// API-nycklar i en VITE_-variabel.
const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)

  if (!res.ok) {
    throw new Error(`API svarade ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export function getCourses() {
  return request('/api/courses')
}

export function getCourse(id) {
  return request(`/api/courses/${id}`)
}
