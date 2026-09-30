# Project progress

**Current Stage:** Stage 9C v5 — Portable / External-Runnable Cleanup

## Stage 1: Public entry journey (COMPLETED)
Landing -> intro flashcards (5, Back / Next / Skip Intro) -> "What would you like to do?" (Create Student Account / Login / Explore Scholarships).
- Intro shows once per browser (`localStorage['mota-intro']`); skippable at any point; "Replay intro" on the choice screen.
- Explore works with no account: five journey tiles (Find For Me, Explore, Check Documents, Apply, Track), scheme info from `CFG`, optional eligibility checker (extracted to `eligBox()`, shared with the applicant dashboard).
- Only Explore and Track (login-gated, opens the existing Applicant tab) are live; other tiles show "Coming soon".

### Files changed
- `public/app.js`: `boot()` and `signOut()` route to intro/choice; original sign-in/up screen renamed `showAuth0()` and wrapped by `showAuth()` (adds Back link); new block before `load();addLinked();`: `showIntro`, `finishIntro`, `showChoice`, `showExplore`, `intent`, `enterApp`, `eligBox`, `INTRO`, `INT`, `schemes`.
- `public/style.css`: appended "Stage 1: public entry" block.
- `PROJECT_PROGRESS.md`: this file.
Unchanged: auth logic (`doAuth`), roles/tabs, officer/committee/ministry views, OCR/AI modules, `CFG`, persistence.

### Routes/components
No URL router exists (single page). Public screens render into `#auth`; the app renders into `#app` via `go()`.

### Known issues / notes
- Sign-up form still offers all roles and "demo mode"; role separation is Stage 2.
- New public screens are English only (Hindi translation dictionary not extended).
- Explore shows only NFST rules (from `CFG`); NOS is a placeholder until Stage 4.

## Stage 2: Authentication and role separation (COMPLETED)
- Sign-up is student-only (name, email, password of 8+ chars with letter and number; duplicate emails blocked). The role picker and "demo mode: switch between all roles" are gone.
- Officials are provisioned: `OFF` in `public/app.js` (officer/committee/admin `@mota.demo`, password `Demo@1234`), shown under "Official login (demo accounts)" on the sign-in screen. They cannot sign up.
- Login checks credentials (salted SHA-256 via `crypto.subtle`, students in `localStorage['mota-users']`). The role comes from the account, never from the user.
- Role routing: landing tab = first of `ROLETABS[role]`; `go()` forces the current tab into the role's own tabs; old v1/demo-mode sessions are discarded (`ses.v==2`). Guest = student-only.
- Files: `public/app.js` (`doAuth` rewritten; `showAuth` wrapper, `boot`, `go`), `public/style.css`, `README.md` (auth paragraph), this file.
- Issues: client-side only, so not real security; role checks are UI-level (a real backend must enforce them). New auth strings are English only. The guest still sees the seeded demo applicant data (Stage 7).

## Stage 3: Interactive student onboarding (COMPLETED)
- One question at a time, all optional: every question has "Skip this question", a "Skip for now" header button leaves the quiz, Back steps through the answers.
- Adaptive (`OQ` in `public/app.js`): Q1 asks the purpose (explore / find / check documents / apply / track). Explore and Track ask nothing more; Check documents asks which document (from `CFG.docs`); Find/Apply ask category, and only for ST (or undeclared) go on to education, a Master's/research follow-up (only if Graduate) and income band. "Another category" ends the quiz with a gentle note. No eligibility verdict is produced.
- Runs automatically once after student sign-up; also reachable from Explore ("Answer a few quick questions"). Returning logins are not re-quizzed.
- Answers stored per email in `localStorage['mota-profiles']` (guest = `guest`). The Explore eligibility box is pre-filled from category/education.
- The summary screen lets the user choose where to go (`obGo`): Explore and Track are live; Find/Check Documents/Apply land on Explore with a "coming soon" note until their stages.
- Files: `public/app.js` (`doAuth` sign-up hook, new Stage 3 block, `showExplore` link + `prefill()`), `public/style.css`, this file.
- Issues: onboarding strings are English only; income bands are broad ranges and are not compared with scheme limits yet (Stage 4).

## Stage 3 refinement (COMPLETED)
- Onboarding Q1 is now "What would you like help with?" with four -ing options (Finding scholarships / Exploring scholarship options / Understanding a scholarship / Checking my documents); supporting text reworded. Options are equal-height (46px), same width, 8px gaps (`.opts`, `.opt` in style.css). "Apply" and "Track" were removed from Q1 (both still reachable from Explore tiles); the new `understand` purpose lands on Explore.
- Fixed: header buttons on public screens (e.g. "Skip for now", "Home") were near-invisible purple on purple (`.pt .s`).

## Stage 4: Scholarship discovery (COMPLETED)
- `public/schemes.js`: demo catalogue of 5 ST schemes (NFST, NOS, Post-Matric, Pre-Matric, Top Class). Limits, deadlines and benefit wording are demo values; NFST education/income/documents are overridden from `CFG`, so the Scheme Engine still controls them.
- Explore (`showExplore`): search box, level filter, "Open now" toggle, scheme cards with Open / Closing soon / Closed (from the demo deadline). List refresh via `dList()`.
- Detail page `showScheme(id)`: who can apply, benefits, documents, deadline, "How this may fit you" (if a profile exists), link to the official portal (scholarships.gov.in, new tab). "Check my documents" and "Apply" are disabled placeholders (Stages 5 and 6).
- "Find scholarships for me" (`showFind`, `fMatch`, `match`): manual form (category, education, income band; prefilled from the onboarding profile) with ranked matches and per-rule chips (Likely fits / May fit / Need more details / Unlikely). Rule-based and explainable, never called eligibility.
- Optional text helper (`aiRead`): fills the form from a sentence or two using Claude if available in the host, otherwise a local keyword reader (`readText`). The user reviews the values; matching stays deterministic.
- Files: `public/schemes.js` (new), `public/app.js` (Stage 4 block, `intent`, `obGo`, `showExplore`), `index.html` (script tag), `public/style.css`, `README.md`, this file.
- Issues: catalogue data is demo, not verified against official notices. Education levels are coarse (Class 12 or below groups school stages). The Claude path of `aiRead` only works inside a host that provides `window.claude`; a deployed static site uses the local reader. Discovery text is English only.


## Stage 4.69: Discovery expanded to the 5 MoTA schemes (COMPLETED)
- Catalogue (`public/schemes.js`) now uses the official scheme names: Pre-Matric, Post-Matric, Top Class Education, NFST, NOS, shown in that order (`catalog()` in `app.js`). It stays the single data source for cards, search, filters, detail pages and matching; nothing was hard-coded elsewhere.
- Cards are a balanced grid (`#dl`, `.sc` in style.css). Detail pages now link to the two official pages given in the problem statement (tribal.nic.in scheme page, DBT Tribal scheme list).
- NFST still takes education, income limit, documents and version from `CFG` (Scheme Engine).
- Verified (scripted, production build): 5 cards, search, level filter, all 5 detail pages open the right scheme, Find-for-me still renders.

## Stage 5: Standalone Check My Documents (COMPLETED)
- New `public/journey.js`. Reusable component `dhMount(id, opts)` (upload, optional type, sample document, result). Standalone page `showDocCheck()` needs no login and no application; optional name/DOB/income to compare (saved in `localStorage['mota-dcp']`).
- Reuses the existing OCR: `docRun` -> `ocrLocal` (Tesseract) -> `parseOcr` in `extract.js`; falls back to the Claude reader only where a host provides it. `dhFind` turns results into plain-language findings: document recognised / wrong type, readable, required fields (`DOCREQ`), possible name / DOB / income mismatch against the entered details, mismatch between documents checked together, possible expiry. Wording is "potential issue"; never fraud/rejected/ineligible.
- Entry points: Explore tile, onboarding "Checking my documents", scheme detail button.
- Officer case-view analysis (`ai()`, `live()`) is untouched. `extract.js` now also exposes `parseDate`.

## Stage 6: Application preparation and submission (COMPLETED)
- `startApply(id)` (login required; guests get a login prompt). 7 steps with progress pills: Personal, Academic, Scheme Information, Documents, Readiness Review, Final Review, Submission. Scheme-specific fields come from `FLD` in `schemes.js` (different for each scheme; demo configuration that only decides what the form asks).
- Documents step mounts one Stage 5 component per required document (`fixed` type), comparing against the applicant's entered details and the other documents. Issues do not block reaching the readiness screen; missing documents, required fields and confirmations block submission. Drafts save per user in `localStorage['mota-drafts']`.
- Readiness (`apReady`): personal details, required information, required documents, readability, scheme requirements (deterministic `pre()` with the same chips as matching; worded "May not match", never ineligible). Buttons Review issue / Continue / Go Back.
- Submission creates a record in `localStorage['mota-applications']`: Application ID, applicant, scheme, scheme version, submitted timestamp, stage/status (Submitted), documents with issues, eligibility pre-check, readiness, official reference.
- Official handoff is `PORTAL` (`prepare`, `submit`, `status`) in `journey.js`: the applicant can enter a real reference number, otherwise a clearly labelled mock `DEMO-...` reference is created. A real authorised integration replaces only this object. No real government API is used or implied.
- Verified (scripted, production build, 30 checks): standalone flow with real OCR output of a fixture, mismatch wording, blocking rules, NFST and NOS field sets, record fields, entered vs mock reference, officer/committee/scheme-engine screens and the entry screens unchanged.

### Files changed (Stages 4.69 to 6)
`public/journey.js` (new), `public/schemes.js`, `public/app.js` (`catalog`, `INT` flags, `intent`, `obGo`, scheme detail buttons and portal links), `public/extract.js` (one line), `public/style.css`, `index.html`, this file.

### Known issues
- Scheme limits, deadlines, benefit wording and document lists are demo values (as labelled in the UI) except NFST rules from `CFG`; they must be checked against official notices. Amounts are not shown; the UI sends users to the official pages.
- Application fields per scheme are demo configuration, not official forms.
- Submitted applications are stored only in this browser and are not yet visible to officers or shown to students beyond the confirmation screen (Stage 7). The officer queue still uses the seeded demo cases.
- Reader handles clear English images only (no PDF, no Hindi text). New stage screens are English only.
- Not tested in a real browser: OCR upload was verified in Node and jsdom (reader output injected), not with an actual file picker.

## Stage 7: Post-submission tracking (COMPLETED)
- New `public/track.js`. The student dashboard (Applicant tab, also the "Track my application" destination) now opens with **My Applications** (`trackUI`, `trkCard`). Each card: scheme, Application ID, submitted date, current stage (+ detail), next stage, last updated, applicant action required / not required, and a 6-node timeline (Application Submitted, Verification, Document Scrutiny, Selection, Sanction, Disbursement) with the current node highlighted. It becomes a vertical timeline on phones. `TMAP` maps the existing 8 workflow stages (`ST`) onto these nodes; `DET` gives the plain-language detail label.
- Deficiency: `ACTION REQUIRED` block (document, issue, what to do) with **Upload New Document**. It mounts the Stage 5 checker (`dhMount`, document type fixed, compared with the applicant's details), and submission is blocked until the check has run so "Pre-check completed" is true. After resubmission the card shows: Document submitted / Pre-check completed (issues noted or not) / Waiting for official verification.
- "Why is my application delayed?" (`whyBox`): current stage, why, action required, last updated, next stage, and the configured 3-day SLA (same value the old `why()` used). Only applicant-facing text is used (no findings, scores or committee data).
- Two sources feed one view model (`items()`): the student's own submissions (`mota-applications`) and the two seeded demo cases (`apps[]`), which the real officer/committee/ministry screens update. Seeded cases are shown under "Demo cases linked to the officer screens"; their ID/submitted date come from `SEED`, and "last updated" from `apps[i].u` or the newest notification.
- Own submissions have no officer feed yet, so a collapsed panel "Prototype: simulate official updates" (`trkSim`) stands in for official actions (advance, raise issue, sanction, record instalment). It is labelled and only appears on the student's own submissions.

## Stage 8: Benefits / payment tracking (COMPLETED)
- Section **Scholarship Benefits** (`payBox`) inside each application card: Total sanctioned / Received / Remaining, then instalments with Paid / Upcoming, payment date and reference. It appears only when a sanction record exists (`ap.pay` / `rec.pay`); otherwise one line says no sanction has been recorded and no amounts are shown. Upcoming instalments show no due dates (none exist).
- Data is created by the real workflow: `sanc()` in `app.js` now calls `payRec` (issue sanction creates the record with the order/reference the ministry admin typed; record disbursement marks the next instalment paid with date and reference). Officer, committee and ministry screens are otherwise unchanged.
- Amounts are demo values only: `PAYD` (Rs 1,20,000 in 4 equal instalments), not scheme data. Labelled as a simulated sanction (mock PFMS adapter).

### Files changed (Stages 7-8)
`public/track.js` (new), `public/app.js` (`applicant()` now renders `trackUI()`; `note()` adds a timestamp `d`; `sanc()` calls `payRec`), `public/journey.js` (confirmation button now "Track my application"), `index.html` (script tag), `public/style.css`, this file. Old `tl()`, `why()`, `docs()` are no longer used by the dashboard but were left in place.

### Verification (scripted, headless Chromium, real browser OCR for the upload)
New submission; verification and scrutiny; deficiency; corrected/resubmitted (real OCR of the sample document, submit blocked before the check); selected; sanctioned; paid instalments; upcoming instalments; no payment data (own and seeded); seeded NOS deficiency and resubmission via the existing `upl`; seeded workflow through officer accept, committee final decision and ministry sanction/disbursement (invoking `act`, `fin`, `sanc`); other student sees none of another's submissions; entry, Explore (5 schemes), officer, committee, ministry, Stage 5 and Stage 6 screens still open; no page errors.

### Known issues
- Own submissions are not visible to officers and their resubmitted documents do not reach the officer queue; that needs the backend phase. Until then the simulate panel is the only way they move.
- Seeded cases can show at most one paid instalment (the ministry screen records the first disbursement only). Instalments 2 to 4 can be paid only on your own submissions via the simulate panel.
- The demo payment amounts and the 3-day SLA are placeholders, not scheme rules. Seeded IDs and dates are fixed demo metadata.
- The submission-to-tracking hand-off was tested with a record in the same format `apSubmit` writes, not through the seven-step form. `mota-applications` stays browser-local.
- Tracking text is English only.

## Stage 9: Final student UX polish (COMPLETED)
Polish only. No new features, no backend or database work, officer/committee/ministry screens untouched.

### Files changed
- `public/app.js`: wording (Log in / Sign up / Create account used everywhere), scheme detail page (back label, sticky Check my documents / Apply bar, official-portal links now secondary, closed-scheme note), empty search result with "Clear search and filters" (`dClear`), Apply tile now scrolls to the scholarship list, removed stale "coming soon" note from the onboarding summary, dashboard hero quick actions, toast `role="status"`, login/signup error `role="alert"`.
- `public/journey.js`: document check (busy/disabled state with spinner, "Try again" after a read failure, non-image file error, "Check another document" / "Upload a different file"), Back-to-scheme from a document check opened from a scheme, application form (Cancel on step 1, clickable progress pills to go back and edit, "Edit my details / Edit documents" on final review, labels tied to inputs, plain step names, auto-save note), submit no longer reports success if saving to the browser fails, plain labels on the confirmation.
- `public/track.js`: empty state ("You haven't submitted an application yet." + Explore Scholarships / Check My Documents), payment placeholder ("Payment information will appear here after sanction or disbursement."), seeded demo cases in a collapsible section (open only when the student has no own application), "Action needed" wording, confirmation toast after sending a corrected document.
- `public/style.css`: appended "Stage 9" block (scoped to `.pw`, `#v .trk`, `.hero`): one button size/radius, card radius and spacing, form field height (44px touch targets), tag size, heading scale, mobile layouts (2-column journey tiles, full-width buttons, scrolling step pills, no overflow), focus colours on dark headers, spinner, disabled state.
- `PROJECT_PROGRESS.md`: this file.
Unchanged: `index.html`, `schemes.js`, `extract.js`, auth logic, scheme engine, OCR modules, officer/committee/ministry views, seed/demo data, storage keys.

### Important UX fixes
- Primary "Sign up" button on the purple header was unreadable; now white on purple.
- Scheme detail cards had no spacing; Apply was buried at the bottom. It is now always reachable in a sticky bar.
- Navigation: Explore -> Details -> Back to scholarships; Details -> Apply -> Cancel/Back (draft kept); Documents opened from a scheme -> Back to scheme; Check -> Check another document; Review -> Edit / step pills; dashboard -> Explore / Check my documents (no dead end).
- Silent failures removed: no-file, wrong file type, read failure (with retry), empty filter result (with clear), failed save on submit.
- Payment amount (Rs 1,20,000) no longer wraps on phones; application step pills scroll instead of wrapping into a tall block.

### Verification (headless Chromium, scripted)
Mobile 375, tablet 768 and desktop 1280: intro skip, sign-up validation and sign-up, onboarding (mobile), find, explore search/empty/clear, scheme detail and back, document check (no file, sample document, check another, back to scheme), apply cancel, step validation, all 7 steps with 5 sample documents, edit from review, confirmation validation, submit, My Applications, simulated verification to sanction and instalment, benefits, no-payment text. No horizontal overflow on any checked screen and no console or page errors. Officer, committee and ministry accounts and all their tabs still render; guest dashboard, seeded demo cases and resubmission block still work.

### Known issues
- `npm test` and a production `vite build` were not run in this session (`node_modules` absent, no network). `extract.js` is unchanged. Run `npm install && npm test && npm run build` before deploying.
- My Applications cards are still fairly long on phones (details are inline, there is no separate application detail page).
- Public and tracking screens are English only (Hindi toggle covers only the older dashboard strings).
- Own submissions still live only in this browser and are not visible to officers; the "simulate official updates" panel stands in until the backend exists. Amounts, deadlines and scheme rules remain demo values.
- Accessibility is practical, not audited (no screen-reader test, no automated contrast tool).

## Stage 9A: ANUGAM 360 rebranding + landing page foundation (COMPLETED)
Branding, navbar, hero and the top of a scrollable landing page. No workflow, auth, backend or officer/admin logic changed. Earlier entries in this file still say "Adhikar" and describe the old intro flashcards / choice screen; both were replaced here.

### What changed
- **Rebrand to ANUGAM 360** (tagline: Accompanying Every Scholar Through the Complete Journey): page title, meta description, app header, public header (`ptop`), login/sign-up panel, favicon and apple-touch icon. The name appears as text next to the logo (`.wm`, "360" highlighted).
- **Logo**: the supplied image is used unchanged in light and dark (no filter, transform, opacity or separate dark version). The supplied file was an RGB PNG with the areas outside the rounded square baked in as solid black, which would show as black corners on any coloured or light surface. Only that outside matte was made transparent (flood fill from the corners plus a 1px edge); every opaque artwork pixel is identical to the supplied file (checked in code). The white rounded square is kept. The untouched original is in `brand/anugam360-logo-original.png`; served files are `public/brand/anugam360-logo.png` (1254 px), `-640.png` (hero), `-192.png` (navbar/headers), plus `public/favicon.png` and `public/apple-touch-icon.png`, all resized from the same artwork. `LOGO` in `app.js` is now this image (old inline SVG and `favicon.svg` removed).
- **Landing page** (`public/landing.js`, new): `showLanding()` is the first screen for logged-out visitors and replaces the 5 intro flashcards and the "What would you like to do?" choice screen (`showIntro`, `finishIntro`, `INTRO`, `seen`/`mota-intro` removed; `showChoice()` now just calls `showLanding()`, so every old Back/Home button lands here). Sections, top to bottom:
  1. Sticky navbar: logo + wordmark, Explore Scholarships, How It Works, FAQ, Sign In, Get Started. Below 860px the links collapse into a menu (Sign In stays visible, Get Started is in the menu); Escape and choosing a link close it.
  2. Hero: name, tagline, the four supporting lines with icons, primary Explore Scholarships, secondary Sign In, a "New here? Get started" link, and the logo at 340px (112px on phones). Sign In, Get Started and the main CTA are above the fold at 1280x720, 1024x768 and on 375x667 / 360x640 phones.
  3. "Where would you like to start?" band, overlapping the hero edge so the page visibly continues. It reuses the existing `INT` journey tiles and `intent()` (Find, Explore, Check documents, Apply, Track), so no new logic.
  4. `#how` and `#faq` anchors: small placeholder blocks so the nav links work now. Stage 9B replaces them; the remaining sections go between the start band and the demo notice (see `showLanding`).
- **Get Started / Sign In / Explore**: Get Started opens student sign-up, which runs the existing Stage 3 onboarding automatically after the account is created. Sign In opens the existing login. Explore Scholarships opens the existing Explore screen.
- **Colours**: the palette tokens on the first three lines of `style.css` and the hard-coded purple gradients were swapped for the logo's navy / blue / green / orange (new token `--hd` = header navy). This recolours the officer, committee and ministry screens too (no layout or logic change); revert by restoring those tokens.
- **Boot order fix (pre-existing bug)**: `boot()` used to run at the end of `app.js`, before `journey.js` / `track.js` loaded, so a logged-in student who reloaded the page got a blank dashboard (`trackUI is not defined`). `boot()` now runs from a last inline script in `index.html` after all scripts have loaded. `landing.js` needs this too.

### Files changed
`index.html` (title, meta, icons, header brand, script order, `boot()` call), `public/app.js` (`LOGO`, brand text, intro code removed, `showChoice`, `boot`, Hindi key for the old title removed, salt comment), `public/style.css` (tokens + Stage 9A block appended), `public/landing.js` (new), `public/brand/*` (new), `public/favicon.png`, `public/apple-touch-icon.png` (new), `public/favicon.svg` (deleted), `brand/anugam360-logo-original.png` (new, source only), `README.md`, this file.
Unchanged: `schemes.js`, `extract.js`, `journey.js`, `track.js`, auth logic, scheme engine, OCR, officer/committee/ministry logic, storage keys, seed data.

### Verified (headless Chromium 141, static copy of `index.html` + `public/`; 90 scripted checks, all passed)
Name, tagline, h1, the four supporting lines and nav labels exact; no "Adhikar" in the DOM or title; logo files load, render square, have no filter/transform/opacity/blend in light or dark and are the same files in both; shipped logo artwork identical to the supplied file; Explore (nav, hero, tile), Sign In (nav, hero), Get Started -> sign-up -> onboarding, sign out -> landing, student login, guest, officer / committee / ministry logins and the ministry Scheme Engine and Audit tabs; Apply, Document check, Find and scheme detail still open; reload while logged in renders the dashboard; How It Works / FAQ scroll and the brand link returns to top; Hindi toggle still works; menu behaviour at 375 / 360 / 768; no horizontal overflow at 375, 360, 768, 1024, 1440 (landing, sign-up, Explore); no console or page errors.

### Known issues
- `npm install`, `npm test` and `vite build` were not run (no `node_modules`, no network). Run `npm install && npm test && npm run build` before deploying. The inline `<script>boot()</script>` is a classic script like the other scripts; confirm it survives the Vite build.
- `#how` and `#faq` are placeholders until Stage 9B. The landing page is English only (Hindi dictionary not extended).
- The landing uses "Sign In" as specified, while the login screen tabs still say "Log in" / "Sign up" (Stage 9 wording). Decide whether to unify.
- The password-hash salt `adhikar-demo-v2:` and all `mota-*` localStorage keys keep their names on purpose (renaming would lock out existing demo accounts). The old `mota-intro` key is no longer used.
- The hero logo card and navbar use system fonts and no web fonts; text in the logo is part of the image and is small in the navbar (the wordmark text beside it carries the name).
- Officer/committee/ministry screens are recoloured only; a fuller visual pass on them is out of scope.

## Stage 9B: landing page core content (COMPLETED)
Added the four main sections below the Stage 9A start band. Landing page only: no change to auth, onboarding, discovery, eligibility, document check, application, tracking, benefits, officer/admin, storage or backend.

### Sections added (order on the page)
Hero and start band (9A) -> **What ANUGAM 360 helps you do** (`#capabilities`: 4 open blocks with a coloured top rule, icon, title and 1-2 lines; not cards) -> **How ANUGAM 360 Works** (`#how`, on a tinted full-width band: one connected horizontal line with four numbered nodes 01-04, vertical timeline on phones; replaces the 9A placeholder) -> **Smart Assistance. Human Decisions.** (`#assistance`: one panel, five assist areas, and the statement "AI assists; authorised officials retain final decision authority."; no chatbot or input) -> **Supported scholarships** (`#schemes`) -> FAQ placeholder (`#faq`, still 9A's placeholder) -> demo notice.
- Scholarship preview reads `catalog()` and renders with the existing `dCards()`, so it is the same card as Explore (name, level, short purpose, Open / Closing soon / Closed, View details -> `showScheme`). No second scholarship list. NFST still follows the Scheme Engine (`CFG`). The "Explore All Scholarships" button calls `showExplore()`. Layout is 3 + 2 on desktop and tablet, one column on phones.
- Benefit summaries are not shown on the preview cards: benefit wording in `schemes.js` is demo data and amounts are unverified, so it stays on the scheme detail page (with its official-portal note). Add it to the cards once wording is verified.

### Files changed
`public/landing.js` (`LCAP`, `LHOW`, `LAI`, `lCaps`, `lHow`, `lAI`, `lPrev`; the `#how` placeholder in `showLanding` replaced), `public/style.css` (Stage 9B block appended), this file. Unchanged: everything else, including `index.html`, `app.js`, `schemes.js`.

### Verified (headless Chromium, static copy)
20 new checks plus the full 90-check Stage 9A/regression suite, all passing: exact headings, step numbers and copy; preview names identical to `catalog()` and markup identical to `dCards(catalog())`; section order; View details and Explore All Scholarships work; How It Works and FAQ nav scroll to their sections; no overflow or clipped sections at 375, 360, 768, 1024, 1280, 1440; light and dark (band and surfaces adapt, logo unfiltered and unchanged); no console or page errors; login, onboarding, apply, document check, find, tracking dashboard, reload-while-logged-in and officer/committee/ministry screens still work.

### Known issues
- Scheme names come from `schemes.js` ("... Scheme for ST Students"), not the shorter names in the brief; edit the data if you want different wording.
- Still not run: `npm install`, `npm test`, `vite build` (no network). Run them before deploying.
- New sections are English only; scheme dates and rules remain demo values.
- Page is now long on phones (about 5 screens); consider collapsing the preview on mobile if it feels heavy.

## Stage 9C: FAQ + final CTA + footer + landing completion (COMPLETED)
Landing page only. No change to auth, onboarding, discovery, eligibility, document check, application, tracking, benefits, officer/admin, storage or backend.

### Added (bottom of the landing page)
- **FAQ** (`#faq`, `LFQ`, `lFaq`): the 5 requested questions in a native `<details name="lfaq">` accordion (keyboard and touch work with no script; one open at a time). Answers only describe what the prototype does: browser-side document reading, potential issues (not verdicts), simulated tracking and demo payment amounts, no connection to official portals.
- **Final CTA** (`lCta`): "Ready to move forward?" with Explore Scholarships (`showExplore`) and Get Started (`showAuth('up')`, then the existing onboarding).
- **Footer** (`lFoot`, `LFC`, `LFN`, `lNote`): supplied logo (192px file, no filter/transform), name, short description, Platform / Support / Trust columns, demo-data line. Platform: Explore Scholarships, How It Works (scroll), Check Documents (`intent('docs')`), Track Application (`intent('track')`; guests get the login prompt). Support: FAQ (scroll), Help / Guidance (scrolls to "Where would you like to start?"). Trust: Privacy, Data & Security and Official Sources open a short note panel in the footer (no new pages); Official Sources links to scholarships.gov.in and tribal.nic.in. No addresses, phones, emails, organisations or affiliations.
- The old `.lfoot` demo-notice block was replaced by the footer's demo line. Page order: Hero, start band, Capabilities, How It Works, Smart Assistance, Scholarship preview, FAQ, Final CTA, Footer.

### Files changed
`public/landing.js` (9C block, `showLanding` tail), `public/style.css` (Stage 9C block appended), `README.md` (landing.js line), this file. Unchanged: `index.html`, `app.js`, `schemes.js`, `journey.js`, `track.js`, `extract.js`.

### Verified (headless Chromium via Playwright, 95 checks, 0 failed)
Desktop 1280, tablet 768, mobile 375, mobile 360 (dark), desktop dark: section order, FAQ open/close/one-at-a-time, no horizontal overflow, no clipped footer/CTA/FAQ, CTA buttons at least 44px tall, footer logo and hero logo unfiltered and unchanged, footer scroll links, Trust notes toggle, Explore / Get Started / Check Documents / Track routes, no console or page errors. Screenshots reviewed on desktop and mobile. Two layout bugs found and fixed during the check (global `nav` styling broke the footer columns; CTA sat flush against the FAQ).

### Known issues
- `npm install`, `npm test` and `vite build` still not run (no `node_modules`, no network). Run `npm install && npm test && npm run build` before deploying and confirm the inline `boot()` script survives the build.
- Not re-run this stage: the earlier full regression (login, apply, tracking, officer screens). Those files were not touched.
- Landing copy is English only. "Sign In" (landing) vs "Log in / Sign up" (login screen) wording is still not unified.
- Privacy and Data & Security are short notes, not policy pages. Real ones are needed before any real use.
- Landing page is long on phones (about 6 screens).

## Post-9C: hero product preview (COMPLETED)
The large logo on the right of the hero was replaced by a compact "Scholarship Journey" preview (`lViz` in `public/landing.js`, "Hero product preview" block at the end of `style.css`). The logo remains in the navbar and footer only, unchanged. Hero copy, CTAs and layout are unchanged; nothing else on the landing page changed.
- Card: four connected rows, Discover (5 schemes, the real scheme names), Check (document check: readable, fields, consistency), Apply (7-step application, "Step 5 of 7 · Readiness Review" as a sample state), Track (the real tracking stage names). Labelled "Preview". The scheme count reads `catalog().length`.
- Chips: "5 schemes available", "Document Check", "Track Your Application". No statistics or results are shown.
- The preview is `role="img"` with a label (inner content `aria-hidden`), uses theme tokens (light and dark), and is hidden at 720px and below so the phone hero keeps its CTAs above the fold. The unused `.lhl` hero-logo CSS is left in place.
- Verified in headless Chromium: 120 checks, 0 failed (desktop, 861 and 768 tablet, 375 and 360 phones, light and dark): no hero logo image, preview shown or hidden as expected, inside the hero, no overflow, CTAs above the fold, navbar/footer logos unfiltered. Screenshot review fixed chip overlaps and a class-name clash.
- Known: the phone hero has no visual (logo removed there too). The Apply and Track states shown are sample UI, not live data.

## Post-9C: landing repetition removed (COMPLETED)
Audit: the same four ideas (Discover, Check, Apply, Track) appeared in the hero lines, the start-band tiles, "What ANUGAM 360 helps you do" and "How ANUGAM 360 Works", with the same icons and near-identical wording.
- Removed the "What ANUGAM 360 helps you do" section (`LCAP`, `lCaps`, `#capabilities`). Its fuller descriptions moved into How It Works (`LHOW`), so each step keeps one title and one informative line.
- Kept: hero (copy, CTAs and preview unchanged), the start band (the only place with action tiles, no account needed), How It Works, Smart Assistance, Scholarship preview, FAQ, CTA, footer.
- Page order now: Hero, Start band, How It Works, Smart Assistance, Scholarship preview, FAQ, Final CTA, Footer. Nav anchors (`#how`, `#faq`) unchanged.
- Files: `public/landing.js` only, plus this file. The `.lcap` / `.lcp` rules in `style.css` are now unused and were left in place.
- Verified: 126 headless-Chromium checks, 0 failed (section order, no `#capabilities`, 4 How It Works steps, no overflow at 360 to 1280, light and dark, no console errors).
- Known: the hero's four supporting lines still echo the same four steps (kept on purpose, hero copy was to stay unchanged). Earlier 9B notes that mention the capabilities section are superseded by this entry.

## Post-9C: hero laptop dashboard graphic (COMPLETED)
The hero-right preview card was redesigned to match the supplied reference (laptop dashboard with floating cards), built in HTML/CSS only (no image file). `lViz` in `public/landing.js`; "Hero product preview: laptop dashboard" block at the end of `style.css` (fixed 560x440 design scaled with `--s`: .92 by default, .8 / .68 / .6 below 1180 / 1040 / 920px; hidden at 720px and below).
- Laptop screen "Your Scholarship Journey": Discover and Check ticked, Apply current, Track pending (sample state). Overlapping "Scholarships" card lists the first three catalogue schemes with real names, levels and Open / Closing soon / Closed from `sstat()` (so it follows the demo deadlines), and "View all". Floating cards: "N schemes available" (`catalog().length`), "Document Check", "Track Your Application", plus a plane and a graduation-cap badge. Not copied from the reference: "Recommended for you" (no personalisation exists, so it says "Scholarships") and the decorative plants and back screens.
- Cards are decorative (`role="img"` on the wrapper, inner `aria-hidden`), not clickable. Colours inside are fixed (the hero is always navy), so light and dark themes look the same.
- Verified: 126 headless-Chromium checks, 0 failed (no hero image, preview inside hero, no overflow at 360 to 1280, CTAs above the fold, navbar and footer logos unfiltered, no console errors); screenshots reviewed at 1280 (light and dark) and 900. Two bugs fixed: a global `.c` card class was styling the "Apply" step, and text overflowed the screen.
- Known: the phone hero still has no visual. The dashboard states are sample UI, not live data. Unused `.lvc` / `.lvl` rules from the previous preview were removed.

## Post-9C: landing page first for guests (COMPLETED)
Bug: opening the site showed the guest dashboard instead of the landing page. Cause: "Continue as guest" saved a session (`mota-session`, empty email) and `boot()` restored it on every load.
- `doAuth` (`public/app.js`) now saves the session only when it has an email (students and officials). Guests live in memory only.
- `boot()` ignores any stored session without an email and removes it, so browsers that already hold an old guest session land on the landing page too.
- Unchanged: logged-in students and officials still reload straight into their dashboard; sign out returns to the landing page.
- Verified (headless Chromium, 133 checks, 0 failed): guest enters dashboard, no session saved, reload gives landing, stale guest session gives landing and is cleared, logged-in student reload gives dashboard, sign out gives landing, no page errors.
- Known: a logged-in student or official who reloads still skips the landing page by design.

## Stage 9C v5: Portable / External-Runnable Cleanup (COMPLETED)
Cleanup and audit only. No product, backend, database, auth, OCR-service, AI or deployment work was added, and Stage 10 was not started. Deployment is not marked complete.

### Audited
Every file in the project (package.json, package-lock.json, vite.config.js, vercel.json, index.html, all of `public/`, `scripts/`, `tests/`, `.env.example`, `.gitignore`, README, this file) for: `localhost` / `127.0.0.1` / `0.0.0.0`; Windows and Unix absolute paths, usernames, home/temp/workspace paths; `process.env` / `import.meta.env` / API base URLs and any `fetch` / XHR / WebSocket use; tool-, vendor- and sandbox-specific leftovers; debug remnants (`console.log`, `debugger`, TODO/FIXME); secrets; lockfile registry hosts; stray OS files (`.DS_Store`, `__MACOSX`, `Thumbs.db`, logs, source maps).

### Changed (3 files; the frontend was not touched)
- `scripts/copy-ocr-assets.mjs`: project root is now resolved with `fileURLToPath(import.meta.url)` instead of a URL-pathname regex. The old code mis-resolved any path containing a space or `%` (e.g. `C:\Users\First Last\...`) and then silently skipped every asset, so `npm run build` would not refresh `public/lib` on such machines. Checked with a path containing spaces and `%20`: old code copied 0 of 5 assets, new code copies 5 of 5.
- `tests/extract.test.mjs`: Tesseract cache dir was the Unix-only `/tmp/tess-cache`; now `path.join(os.tmpdir(), 'tess-cache')`.
- `README.md`: one short paragraph stating that the `localhost` ports in the run instructions are Vite development/preview defaults and appear nowhere in application code, and what `--host 0.0.0.0` in `npm start` / `npm run preview` does. Nothing else in the README changed.

### Intentionally left unchanged
- The frontend: `index.html` and every file in `public/` are byte-identical to Stage 9C v5 (same SHA-256 over the whole tree). UI, layout, colours, typography, branding, copy, routes, interactions and behaviour are unchanged. `package.json`, `vite.config.js`, `vercel.json` and `.gitignore` are also unchanged.
- No API/base URL exists in the frontend (there is no backend and no `fetch` to any server), so no `VITE_API_URL` was introduced and no backend URL was invented. `.env.example` still lists no active variables.
- Three guarded `window.claude` / `claude.use('sample')` fallbacks (`public/app.js` in `ai()` and `aiRead()`, `public/journey.js` in `docRun()`). They only run if a host page provides that global, so they do nothing on a normal machine; the bundled Tesseract OCR and the local keyword reader are always used instead. Left in place because removing them is a change to frozen frontend code and they are not a portability problem. They can be removed later if wanted.
- `tests/make-fixtures.py` looks for DejaVu Sans under `/usr/share/fonts` (Linux). It is an optional fixture generator (Pillow); the generated PNGs are committed and nothing else depends on it.
- `public/lib/*`: vendored Tesseract files, unmodified.
- No `.env`, keys, tokens or credentials exist anywhere in the project. `.env` and `.env.local` are git-ignored. `package-lock.json` resolves only from `registry.npmjs.org`.
- The `brand/` source logo, the Vercel/Netlify/Cloudflare/GitHub Pages notes in the README, and the earlier stage history in this file.

### localhost / 127.0.0.1 classification
- `127.0.0.1`: no occurrences in the project.
- `README.md` (`http://localhost:5173`, `http://localhost:4173`, the sentence "No localhost URLs are hard-coded", and the new dev-only paragraph): VALID DEVELOPMENT REFERENCE.
- `package.json` scripts `preview` and `start` (`--host 0.0.0.0 --port 4173`): VALID DEVELOPMENT REFERENCE (local preview server binding).
- `public/lib/worker.min.js` (one `localhost` inside the vendored Tesseract's URL-validation regex; it never connects anywhere): VALID DEVELOPMENT REFERENCE (vendor code, unmodified).
- PROBLEMATIC RUNTIME DEPENDENCY: none found, so nothing needed fixing. Other path-like strings that are not machine paths: `/home/web_user` inside the Tesseract WASM bundles (Emscripten's virtual filesystem), and the word "Desktop" in this file (a viewport name).

### Build / smoke-test result
- Environment limit: the package registry was blocked in the sandbox used for this stage, so `npm install`, `npm run build` (Vite) and `npm test` (needs `tesseract.js` from `node_modules`) could NOT be run here. Please run `npm install && npm run build && npm test` once on the target PC to confirm.
- What was run instead: `node --check` on every JS/MJS file (all pass); the asset script in a spaced path with and without `node_modules`; a static copy of what Vite emits for this project (`index.html` plus `public/*`, since it has only classic scripts and no bundled modules) served locally and loaded in headless Chromium 141 at 1280 and 375 px: landing page renders with all sections, no console or page errors, no failed requests, no horizontal overflow, every request goes to the serving origin only (no external or localhost-backend calls), and all OCR/brand assets return 200. The real in-browser OCR pipeline (`ocrLocal`) was run on the bundled `table.png` fixture using only the shipped `public/lib` files and returned the expected fields (name, DOB, certificate no., issue date, issuing authority).

### Remaining development-only localhost references
README run instructions (ports 5173 and 4173), the `--host 0.0.0.0` flag in the `preview` / `start` scripts, and the vendored Tesseract regex above. None affect the production build.

## Next: Stage 10, Backend + Database Foundation
Not started. Replace `localStorage` (users, profiles, drafts, `mota-applications`, document checks) with a real API and database, enforce roles on the server, and connect student submissions to the officer queue. `PORTAL` in `journey.js` remains the only place for official-portal integration.
