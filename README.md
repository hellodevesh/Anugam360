# ANUGAM 360: Accompanying Every Scholar Through the Complete Journey
Scholarship case-management prototype for MoTA schemes (SIH PS 26239). Formerly shown as "Adhikar".

Digital case-management prototype for Scheduled Tribe scholarship/fellowship schemes (NFST, NOS).
All scheme rules, scores, volumes and documents are **demo data**. AI/OCR output is a *review signal*; officers decide.

**Architecture:** a static frontend (Vite build, plain JavaScript). There is **no backend, API or database**, so nothing else needs deploying and **no environment variables are required**. OCR (Tesseract.js) runs entirely in the visitor's browser, and its engine and English language data ship inside `public/lib` (no CDN). Demo state is kept in the browser's localStorage. No `localhost` URLs are hard-coded.

**Login / sign-up (prototype, browser-only):** students self-register (email + password; a salted SHA-256 hash is kept in this browser's localStorage). Official accounts (Verification Officer, Selection Committee, Ministry Admin) cannot be self-registered; three provisioned demo accounts (`officer@`, `committee@`, `admin@mota.demo`, password `Demo@1234`) are listed under "Official login". Role is fixed by the account and decides which screens exist. This is client-side only: replace with a real identity provider and server-side role checks before any real use.

## Run locally
```bash
npm install
npm run dev        # development server (http://localhost:5173)
npm run build      # production build -> dist/
npm start          # serves the production build (http://localhost:4173)
npm test           # OCR + field-extraction regression test on 6 dummy layouts
```
Requires Node 18+ (tested on Node 22).

The `localhost` addresses above are the default development/preview ports of Vite and appear only in these instructions; no application code references them. `npm start` / `npm run preview` bind to all network interfaces (`--host 0.0.0.0`) so the production build can be opened from another device on the same network; these are local preview tools, not a deployment setup.

## Deploy free on Vercel (recommended)
**Option A: GitHub (auto-redeploys on every push)**
1. Create a GitHub repository and push this folder (`node_modules/` and `dist/` are already git-ignored):
   `git init && git add . && git commit -m "init" && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main`
2. Go to https://vercel.com, sign up with GitHub, click **Add New > Project** and import the repo.
3. Vercel detects **Vite** from `vercel.json`. Keep: Build Command `npm run build`, Output Directory `dist`. No environment variables.
4. Click **Deploy**. You get a URL like `https://<project>.vercel.app`.

**Option B: Vercel CLI (no GitHub)**
```bash
npm install -g vercel
vercel login
vercel          # first run: accept the defaults (preview)
vercel --prod   # publish to the production URL
```

## Other free hosts
- **Netlify:** Build command `npm run build`, publish directory `dist`.
- **Cloudflare Pages:** framework preset Vite, build `npm run build`, output `dist`.
- **GitHub Pages:** needs a sub-path, so set `base: '/<repo-name>/'` in `vite.config.js` and change the absolute paths in `index.html` (`/app.js`, `/landing.js`, `/extract.js`, `/style.css`, `/favicon.png`, `/brand/...`, `/lib/...`) and in `public/app.js`/`public/landing.js` (`/brand/...` image paths) and `public/app.js` (`lib/...` are already relative) to include that prefix.

## Project layout
```
index.html               page shell
public/landing.js        public landing page: navbar, hero, start band, hero, capabilities, how it works, assistance, scholarship preview, FAQ, final CTA and footer (Stages 9A to 9C)
public/brand/            ANUGAM 360 logo files (transparent-corner PNG + 640/192 px sizes); favicon.png, apple-touch-icon.png
brand/                   the logo exactly as supplied (source only, not served)
public/app.js            application logic (all roles, workflow, Hindi/English, live OCR flow)
public/schemes.js        demo scholarship catalogue for discovery (Stage 4)
public/extract.js        layout-tolerant field extraction from OCR text (fuzzy labels, next-line values, sentence patterns)
public/style.css         styles (light/dark)
public/lib/              bundled OCR engine + English data (refreshed from node_modules by `npm run build`)
scripts/copy-ocr-assets.mjs
tests/                   fixtures generator (Pillow) + npm test
vercel.json, vite.config.js
```

## Document scanning: what it handles and what it does not
Works on clear images (PNG/JPG/WebP) of English documents: `Label: value`, `Label   value` tables, label-above-value, and sentence-style certificates ("This is to certify that Shri ... annual income of Rs ..."). It reads name, DOB, certificate number, income, issuing authority, issue date, institution, course, marks, account number, IFSC, passport number, and flags apparent expiry.
It does **not** handle: PDFs (convert pages to images first), Hindi/regional-language text (add the matching `*.traineddata.gz` to `public/lib/lang` and load that language), heavily skewed, handwritten or stamp-covered text. Fields are extracted with rules, so an unusual layout may need a new label added to the `F` list in `public/extract.js`. Always verify against the document; real deployment needs an approved OCR service and accuracy testing on real samples.

## Privacy note
Documents are processed in the browser and are not uploaded anywhere by this app. Use dummy documents only for demos.
