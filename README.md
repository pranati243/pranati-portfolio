# Pranati Arun — Ocean Portfolio

An underwater portfolio site: a live WebGL ocean (fish, jellyfish, a sea turtle, coral, drifting
particles and light shafts), glassmorphic content panels, and **Coral** — a Gemini-powered AI guide
who answers questions about the work.

Frontend-only by design: **one Vercel project, one deploy, one URL.** No Express server, no MongoDB.

---

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 7 + React 19 |
| 3D | `three` + `@react-three/fiber` (lazy-loaded, split into its own chunk) |
| Content | Static JS modules in `src/data/` — bundled at build time |
| Chatbot | `api/ask.js`, a Vercel serverless function that proxies Gemini and hides the API key |
| Styling | Hand-written CSS with custom properties. No framework. |
| Routing | None — single page, anchor-scrolled sections |

## Getting started

```bash
npm install
```

Then either:

```bash
npm run dev
```

Plain Vite on <http://localhost:5173>. The `/api` route does **not** run here, so Coral falls back
to her offline answer bank (`src/services/coralFallback.js`) — the site works fully, the answers
are just canned rather than generative.

```bash
npx vercel dev
```

Runs the site *and* the serverless function, so you can test real Gemini replies locally. Put your
key in `.env.local` first (see `.env.example`).

## Coral and the Gemini key

1. Get a key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Local: copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`.
3. Production: Vercel → Project → Settings → Environment Variables → add `GEMINI_API_KEY`.

**The key stays server-side.** It is read inside `api/ask.js` via `process.env` and is never
bundled into the browser. Do not rename it to `VITE_GEMINI_API_KEY` — anything prefixed `VITE_`
is shipped to the client and would be readable by any visitor.

How a message flows:

```
CoralChat  →  POST /api/ask { message, history }
              └─ api/ask.js  ── per-IP rate limit (12/min)
                             ── builds the system prompt from src/data/portfolio.js
                             ── calls Gemini (gemini-2.5-flash) with the key from env
              ←  { reply }
    on any failure (no key, timeout, offline, 5xx)
              →  src/services/coralFallback.js answers locally, in Coral's voice
```

Coral's persona lives in `buildSystemPrompt()` in `api/ask.js`: 1–2 sentence replies, casual,
always says "Pranati" by name, at most one emoji, answers only from the portfolio data, and
redirects off-topic questions. The offline bank mirrors the same voice.

## Deploying

```bash
npx vercel --prod
```

Or connect the repo in the Vercel dashboard — it auto-detects Vite. `api/ask.js` is picked up
automatically and deployed as a function next to the static build. Set `GEMINI_API_KEY` in project
settings before the first deploy, or Coral will run in offline mode.

## Editing content

All copy lives in `src/data/` — no CMS, no database:

| File | Holds |
|---|---|
| `projects.js` | Project cards + the "why I built this" text |
| `skills.js` | Skill categories and their items |
| `about.js` | Bio, interests, strengths/weaknesses, contact links |
| `resume.js` | Experience, education, certifications |
| `portfolio.js` | Assembles the above into Coral's context — no edits needed |

Replace `public/resume.pdf` to update the download. Anything added to these files is
automatically visible to Coral too.

## Structure

```
api/ask.js                     Gemini proxy (serverless, server-side key)
public/                        resume.pdf, favicon
src/
  data/                        all site content
  context/                     OceanContext (calm mode), CoralContext (chat state)
  hooks/                       intersection observer, scroll spy, media queries
  utils/                       device tiers, performance tiers, scroll, easter eggs
  services/                    coral.js (fetch + fallback), coralFallback.js (offline bank)
  styles/                      variables, animations, global, content
  components/
    Background/                gradient → 2D canvas → WebGL fallback chain
      three/                   scene, creatures, particles, caustics, camera
    Navigation/ Hero/ Projects/ Skills/ About/ Resume/ Contact/
    Coral/                     orb, chat panel, SVG mascot
    common/                    Button, Modal, Toast, Tooltip, Section, FadeInSection
```

## Performance and accessibility notes

- **Three rendering tiers.** WebGL scene → 2D canvas ocean → gradient + CSS waves. The chain
  degrades automatically on WebGL failure or context loss; the gradient is always underneath, so
  the page is never blank.
- **Device tiers.** Particle count, caustics, antialiasing and texture size scale by device
  (`src/utils/deviceDetection.js`). Pixel ratio is capped at 2x everywhere.
- **Frame budgets.** Particles update at 30fps, caustics 20fps, the seabed 15fps — each system
  skips its expensive work between ticks while cheap transforms keep running every frame.
- **CSS tier.** A separate score sets `data-performance` on `<html>`, which scales backdrop blur
  (18px / 12px / 6px). Browsers without `backdrop-filter` get near-opaque panels instead.
- **Calm mode.** The toggle in the nav drops the WebGL scene entirely. It turns itself on by
  default for visitors with `prefers-reduced-motion`, who can still opt back into the full scene.
- **Accessibility.** Skip link, one focus-ring recipe everywhere, `aria-label` on every icon-only
  control, Escape closes the chat/modal/menu, the whole 3D layer is `aria-hidden`, and reduced
  motion is handled globally and again per component.

## Easter eggs

Type `hello` or `help` anywhere on the page. Ask Coral for "the secret of the ocean".
