# deploy-example-frontend

Exempelrepo för driftsättning av en React + Vite-frontend på GitHub Pages.
Används som referens i kursen DV1677 HT26, vecka 5.

Appen hämtar sin data från [`deploy-example-backend`](https://github.com/jsramverk-ht26/deploy-example-backend)
— samma kurskatalog-API som användes i vecka 3. Tillsammans visar de två repona
hela kedjan: **SPA på GitHub Pages ↔ Express-API i Docker på VPS**.

> **Avskalat med flit.** Det här repot innehåller så lite som möjligt utöver det
> som krävs för att förstå driftsättningen. Vill ni se en fullständig applikation,
> titta på [`coed-frontend`](https://github.com/jsramverk-ht26/coed-frontend) eller
> [`resource-booking-frontend`](https://github.com/jsramverk-ht26/resource-booking-frontend).

---

## Innehåll

- [Lokal utveckling](#lokal-utveckling)
- [Driftsättning — steg för steg](#driftsättning--steg-för-steg)
  - [1. vite.config.js — base-sökvägen](#1-viteconfigjs--base-sökvägen)
  - [2. deploy.yml](#2-deployyml)
  - [3. Aktivera Pages i repo-inställningarna](#3-aktivera-pages-i-repo-inställningarna)
  - [4. VITE_API_URL som repository variable](#4-vite_api_url-som-repository-variable)
- [Byggtid vs körtid — skillnaden mot backend](#byggtid-vs-körtid--skillnaden-mot-backend)
- [CORS — backend måste släppa in er](#cors--backend-måste-släppa-in-er)
- [Vanliga problem](#vanliga-problem)

---

## Lokal utveckling

```bash
git clone <repo-url>
cd deploy-example-frontend
cp .env.example .env
npm install
npm run dev
```

Appen körs på <http://localhost:5173>.

Med tom `VITE_API_URL` går alla `/api`-anrop via Vites proxy till
`http://localhost:3000` — alltså er lokalt körande backend. Webbläsaren ser
dem som samma origin, så CORS blir aldrig ett problem lokalt.

Vill ni istället använda den driftsatta backenden, sätt i `.env`:

```
VITE_API_URL=https://dv1677-picard.nplab.bth.se
```

---

## Driftsättning — steg för steg

### 1. vite.config.js — base-sökvägen

Ett GitHub Pages "project site" ligger i en **underkatalog**:

```
https://jsramverk-ht26.github.io/deploy-example-frontend/
                                 └─ reponamnet ─┘
```

Vite bygger som standard länkar från roten (`/assets/index.js`), men filerna
hamnar på `/deploy-example-frontend/assets/index.js`. Resultatet blir en vit
sida och 404 på alla JS- och CSS-filer.

Lösningen är `base`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/deploy-example-frontend/',   // byt till ERT reponamn
})
```

Snedstreck både i början och slutet. Det här är det vanligaste felet vid
Pages-driftsättning — räkna med att någon i gruppen går på det.

### 2. deploy.yml

Lägg `.github/workflows/deploy.yml` i repot. Den bygger appen och publicerar
`dist/` med GitHubs officiella Pages-actions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

Jämför med backend-repots `deploy.yml`: samma idé — bygg, publicera — men
utan Docker, ghcr.io och SSH. Det finns ingen server att logga in på.

### 3. Aktivera Pages i repo-inställningarna

**Det här steget går inte att automatisera.** Gör det manuellt en gång:

> Settings → Pages → Build and deployment → Source: **GitHub Actions**

Står det `Deploy from a branch` kommer workflowet att köra grönt men ingenting
publiceras. Ett tyst fel som är lätt att missa.

### 4. VITE_API_URL som repository variable

> Settings → Secrets and variables → Actions → fliken **Variables** → New repository variable

| Namn | Värde |
|------|-------|
| `VITE_API_URL` | `https://dv1677-picard.nplab.bth.se` |

Använd **Variables**, inte Secrets — se nästa avsnitt.

---

## Byggtid vs körtid — skillnaden mot backend

Det här är den viktigaste skillnaden mot vecka 3, och den som orsakar flest
missförstånd.

| | Backend (VPS) | Frontend (Pages) |
|---|---|---|
| Var finns hemligheten? | `.env` på servern | Ingenstans — allt är publikt |
| När läses variabeln? | Vid **körning**, av Node | Vid **bygget**, av Vite |
| Går den att dölja? | Ja | **Nej** |

I vecka 3 skrev deploy-workflowet en `.env`-fil på VPS:en med `MONGODB_URI`.
Den filen ligger på en server ni kontrollerar och når aldrig användaren.

På GitHub Pages finns ingen server. Allt som publiceras är statiska filer som
laddas ner till besökarens webbläsare. När Vite bygger ersätter den
`import.meta.env.VITE_API_URL` med värdet **som textsträng i JS-filen**:

```js
// det ni skriver
fetch(`${import.meta.env.VITE_API_URL}/api/courses`)

// det som hamnar i dist/assets/index-abc123.js
fetch(`https://dv1677-picard.nplab.bth.se/api/courses`)
```

Vem som helst kan öppna filen och läsa värdet.

> **Lägg därför aldrig lösenord, API-nycklar eller databassträngar i en
> `VITE_`-variabel.** Att lägga den som GitHub *secret* hjälper inte —
> den hamnar i bundlen ändå. Secrets skyddar värdet i workflow-loggen,
> inte i det byggda resultatet.

Behöver ni skydda något: lägg det i backend och låt frontenden anropa backend.

---

## CORS — backend måste släppa in er

Lokalt går anropen via Vites proxy och ser ut att komma från samma origin.
I produktion gör de inte det:

```
Frontend: https://jsramverk-ht26.github.io
Backend:  https://dv1677-picard.nplab.bth.se
          └─ annan origin ─┘
```

Webbläsaren blockerar då svaret om inte backend uttryckligen tillåter det.
Felet i konsolen ser ut så här:

```
Access to fetch at 'https://...' from origin 'https://jsramverk-ht26.github.io'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is
present on the requested resource.
```

Lägg till `cors` i **backend**-repot:

```bash
npm install cors
```

```js
// app.js
import cors from 'cors';

app.use(cors());   // tillåter alla origins — enklast under kursen
```

Vill ni snäva in det till bara er frontend:

```js
app.use(cors({ origin: 'https://jsramverk-ht26.github.io' }));
```

> **Varför fungerade det med curl?** CORS kontrolleras av *webbläsaren*, inte
> av servern. `curl` bryr sig inte om headern, så ett API kan se helt friskt ut
> i terminalen och ändå vara oanvändbart från en webbsida.

---

## Vanliga problem

| Symptom | Trolig orsak |
|---------|--------------|
| Vit sida, 404 på `/assets/...` i konsolen | `base` saknas eller fel i `vite.config.js` |
| Workflow grönt men sidan uppdateras inte | Pages Source står på `Deploy from a branch` istället för `GitHub Actions` |
| `blocked by CORS policy` | Backend saknar `cors`-middleware |
| Anropen går till `localhost:3000` i produktion | `VITE_API_URL` är inte satt som repository variable |
| Direktlänk till `/courses/abc` ger 404 | Se nedan |

### Djuplänkar ger 404

GitHub Pages är en statisk filserver. En direktlänk till `/courses/abc123`
letar efter en fil på den sökvägen och hittar ingen — react-router hinner
aldrig starta.

Repot löser det med `public/404.html`, som kodar sökvägen till en query-sträng
och skickar användaren till `index.html`, där en liten snutt i `<head>` skriver
tillbaka rätt URL.

Enklare alternativ: byt `BrowserRouter` mot `HashRouter` i `src/main.jsx`.
URL:erna blir då `/#/courses/abc123`, vilket Pages alltid klarar. Fulare
adresser, men noll specialfall.

---

## Relaterade repon

| Repo | Roll |
|------|------|
| [`deploy-example-backend`](https://github.com/jsramverk-ht26/deploy-example-backend) | API:t den här appen hämtar data från — Docker + VPS (vecka 3) |
| [`me-react`](https://github.com/jsramverk-ht26/me-react) | React/Vite-grunder (vecka 3) |
| [`coed-frontend`](https://github.com/jsramverk-ht26/coed-frontend) | Fullständig referensapp — texteditor |
| [`resource-booking-frontend`](https://github.com/jsramverk-ht26/resource-booking-frontend) | Fullständig referensapp — bokningssystem |
