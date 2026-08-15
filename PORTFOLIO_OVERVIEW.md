# Portfolio — Structure & Functionality Overview

A frontend-only ocean-themed portfolio for Pranati Arun, with **Coral** — a Gemini-powered
AI guide — built as a single Vite + React app deployed as one Vercel project (static site +
one serverless function, no separate backend, no database).

Live: https://portfolio-pranati.vercel.app
Repo: https://github.com/pranati243/pranati-portfolio

---

## 1. Stack

| Concern | Choice |
|---|---|
| Build | Vite 7, React 19 |
| 3D | `three` + `@react-three/fiber`, lazy-loaded into its own chunk |
| Content | Static JS modules in `src/data/` — bundled at build time, no CMS/DB |
| Chatbot backend | `api/ask.js`, a Vercel serverless function proxying Gemini |
| Styling | Hand-written CSS with custom properties, no framework |
| Routing | None — single page, anchor-scrolled sections |
| Fonts | Inter (body), Manrope (headings/UI), Fraunces (hero greeting only), Orbitron (Coral's own UI only) |

---

## 2. Directory structure

```
api/
  ask.js                       Gemini proxy — the only server-side code in the project

public/
  resume.pdf, favicon.svg

src/
  main.jsx                     Entry point — mounts <App> inside OceanProvider + CoralProvider
  App.jsx                      Page shell: nav, all sections in order, Coral, toast, easter eggs

  data/                        All site content — the "database"
    projects.js                 4 projects: IMS, LabLink, ERAS, Options Engine
    skills.js                   Categories: Languages, Frontend, Backend, Databases, ML, Cloud & Tools
    about.js                    Bio, interests, strengths/weaknesses, funFacts (for Coral), contact
    resume.js                   Education, experience (with `current`/`distinction` flags), achievements, activities
    portfolio.js                 Assembles the above into Coral's LLM context (getPortfolioContext())

  context/
    OceanContext.jsx            "calm mode" toggle (drops the WebGL scene) — not a light/dark theme
    CoralContext.jsx            Chat open/closed state, queued questions from "Ask Coral" buttons elsewhere

  hooks/
    useIntersectionObserver.js  Backs the scroll-reveal (FadeInSection)
    useScrollSpy.js             Nav active-link tracking
    useMediaQuery.js            usePrefersReducedMotion, useIsMobile

  services/
    coral.js                     askCoral() — POSTs to /api/ask, falls back to coralFallback on any failure
    coralFallback.js             Offline rule-based answer bank (used when Gemini is unreachable)

  utils/
    deviceDetection.js           WebGL support check, device/perf tier for the 3D scene
    performanceUtils.js          CSS-level performance tier (drives backdrop-blur amount)
    scrollUtils.js                Smooth-scroll-to-section helpers
    easterEggs.js                 KeySequenceDetector — "hello"/"help" typed anywhere

  styles/
    variables.css                 Design tokens: palette, glass recipe, spacing, fonts, z-index contract
    animations.css                 Shared @keyframes library
    global.css                     Base elements, .glass recipe, buttons, section chrome, focus rings
    content.css                    Skills/About/Resume/Contact section styles

  components/
    Background/                   The ocean itself — see §4
    Navigation/                    Nav bar + mobile slide-in menu
    Hero/                          Landing section
    Projects/                      Project cards + "why I built this" modal
    Skills/                        Skill category cards
    About/                         Bio + strengths/weaknesses
    Resume/                        Experience/education/awards timeline
    Contact/                       Contact method cards
    Coral/                         The chatbot — see §5
    common/                        Button, Modal, Toast, Tooltip, Section, FadeInSection, ErrorBoundary, Footer
```

---

## 3. Design system (`src/styles/`)

- **One glassmorphism recipe** (`.glass` in `global.css`): `backdrop-filter: blur(var(--glass-blur))`,
  translucent navy background, cyan border, a subtle top-edge highlight via `::before`. Every panel
  on the site uses this one class.
  - **Gotcha (hit 3 times this build):** `.glass` sets `position: relative` for its highlight
    pseudo-element. Any element that is *also* `.glass` and needs `fixed`/`absolute` positioning
    (the chat panel, the toast, the mobile menu) must use a **compound selector**
    (`.coral-panel.glass { position: fixed }`) — a single-class rule of equal specificity can lose
    depending on which stylesheet the bundler happens to emit last, silently dropping the element
    back into normal document flow.
- **Performance tiers**: `detectPerformanceLevel()` scores the device (CPU cores, memory, connection,
  mobile UA) into `high`/`medium`/`low`, set as `data-performance` on `<html>`. CSS branches blur
  amount from 18px down to 6px. Browsers without `backdrop-filter` support get near-opaque panels.
- **Fonts, deliberately scoped**:
  - `--font-primary` (Inter) — body text.
  - `--font-heading` (Manrope) — every heading, nav, buttons, stat numbers. Originally Orbitron
    site-wide; narrowed after review because a sci-fi display face on a name/job-title read as
    unprofessional.
  - `--font-serif` (Fraunces) — **only** the hero's "Hi, I'm Pranati Arun" line.
  - `--font-ocean` (Orbitron) — **only** Coral's own UI (orb label, panel name, nudge heading), where
    a distinct typographic voice for the AI character is intentional.
- **Touch targets**: `@media (hover:none) and (pointer:coarse)` enforces 44px minimum on buttons,
  pills, and a handful of custom interactive elements (`nav__calm`, `project-card__ask`,
  `coral-panel__close`, `coral-suggestion`) that were added after the original rule was written and
  had to be added to it explicitly.
- **Motion**: `prefers-reduced-motion` handled globally (kills all animation durations) and again
  per-component as belt-and-suspenders. Reduced-motion visitors default into calm mode.

---

## 4. The ocean (`src/components/Background/`)

Three-tier fallback chain, so the page is **never blank**:

```
GradientBackground (always mounted, underneath everything)
  → ThreeOceanBackground (WebGL, lazy-loaded)
    → CanvasOceanBackground (2D canvas, if no WebGL)
```

- `OceanBackground.jsx` owns the tier selection: checks `isWebGLSupported()`, and on
  `webglcontextlost` or a render error, downgrades to the next tier automatically.
- `GradientBackground.jsx` — animated CSS gradient + two parallax SVG wave layers + rising bubbles.
  This alone *is* the whole background in calm mode.
- `ThreeOceanBackground.jsx` — the `<Canvas>` host, wrapped in an error boundary, pixel ratio capped
  at 2x, `powerPreference`/`antialias`/particle count all scaled by `getPerformanceConfig()`.
- `three/UnderwaterScene.jsx` — hand-placed (not random) creature composition so nothing sits behind
  the hero's text:
  - 8 `SwimmingFish` on figure-eight paths, banking into turns via a look-ahead point.
  - 7 `FloatingJellyfish`, bell pulses independently of tentacle sway.
  - 7 `CoralReef` clusters — muted rose/plum (originally bright pink, desaturated after review),
    pushed to z −11..−19 so they read as background scenery, not foreground clutter.
  - 4 `Kelp` strands, each segment lagging the one below it for a current-driven whip.
  - 1 `SwimmingTurtle` on a wide slow circuit — the only creature initially without an emissive tint;
    fixed to match the faint glow every other creature carries.
  - `ParticleSystem` (~1800 marine-snow points, additive blending), `CausticsEffect` (procedural
    canvas texture, not a real caustics shader), `LightRays`, `OceanFloor` (simplex-noise displaced).
  - `InteractiveCamera` — parallax on pointer move, and the camera **sinks** as the page scrolls.
- **Frame budgets**: particles update at 30fps, caustics 20fps, seabed 15fps — each system checks a
  timestamp and skips its expensive work between ticks, independent of the actual render loop FPS.

---

## 5. Coral, the AI guide (`src/components/Coral/`, `src/services/`, `api/ask.js`)

### Where she lives on the page
- `CoralOrb.jsx` — the floating glow-sphere button, fixed bottom-right, always mounted.
- `CoralNudge.jsx` — a one-time dismissible bubble + curved arrow pointing at the orb, shown after
  scroll or idle delay, persisted to `localStorage` so it never nags a returning visitor. The arrow's
  landing point was verified against the orb's real rendered position via `getScreenCTM()` after an
  earlier version missed by 66px vertically.
- `CoralChat.jsx` — the panel: full scrolling message history (not single-message-only), typewriter
  reveal on new replies, suggestion chips on first open, docked above the orb on desktop / full-screen
  sheet on mobile.
- `CoralAvatar3D.jsx` / `CoralStage3D.jsx` / `CoralCharacter.jsx` — her 3D character at the top of the
  panel: translucent glowing bell, coral-branch "hair," tentacles, eyes that track the cursor anywhere
  on the page, mouth that opens on a synthetic speech rhythm while she's "speaking," and a lean-in/glow
  change between idle/thinking/speaking moods.
  - **Architectural note**: `CoralStage3D` (the `<Canvas>` + its contents) is one lazy-loaded module,
    not two separate ones. An earlier version had `<Canvas>` load eagerly with `CoralCharacter` as a
    *separate* `React.lazy` child and the `<Suspense>` boundary outside the canvas — this silently
    failed. React Three Fiber runs its own reconciler root, so a DOM-level Suspense boundary can't
    catch a promise thrown by a lazy component *inside* the canvas; the scene never committed, with
    no error, no thrown exception, and a correctly-sized empty canvas. Collapsing to one boundary
    around the whole module fixed it.
  - `CoralAvatar.jsx` is the flat 2D SVG fallback mascot, used when WebGL is unavailable, in calm
    mode, on reduced motion, or if the context is lost mid-session.

### How a message actually gets answered
```
CoralChat → askCoral(question, history)         [src/services/coral.js]
  → POST /api/ask { message, history }
      api/ask.js (Vercel serverless function):
        - per-IP rate limit (12/min, in-memory)
        - builds system prompt from getPortfolioContext() (src/data/portfolio.js)
        - calls Gemini (gemini-2.5-flash) with GEMINI_API_KEY from process.env
      ← { reply }
  on ANY failure (no key, network error, timeout, Gemini quota exhausted, non-200)
      → answerLocally(question)   [src/services/coralFallback.js]
```
- **The key never reaches the browser.** It's read via `process.env` inside `api/ask.js` only,
  set in Vercel's dashboard env vars (Production + Preview). It is *not* prefixed `VITE_` —
  anything with that prefix gets bundled into client JS and would be readable by any visitor.
- **Offline fallback is not a degraded experience by accident** — it's designed to be
  indistinguishable in voice: same "Pranati by name," 1–2 sentence, ≤1-emoji tone, and it
  interpolates real data (project names, current role, distinction badges) rather than using
  purely canned strings. It also handles the same "fun question" categories (favourite film, beach
  vs. mountains, light trivia like the value of pi) that the live model does, so quota exhaustion
  doesn't visibly change what Coral is willing to talk about.
- **Gemini free tier is capped at 20 requests/day** on the current key. Once exhausted, real visitors
  transparently get the offline bank — no error is ever shown to them.
- Coral's persona (identity rules, tone, easter egg, scope guard) is defined once, in
  `buildSystemPrompt()` inside `api/ask.js`, and mirrored in `coralFallback.js`'s rule set.
- **She also knows about the site itself, not just Pranati's career** — `siteMeta` in
  `src/data/portfolio.js` (React/Vite/Three.js/Gemini/Vercel, plus the repo URL) answers
  "what did you build this with?"-style questions, which previously fell through to a generic
  "Pranati hasn't put that on the site" deflection since her context was scoped to projects/resume
  only.

---

## 6. Content sections

All five read directly from `src/data/*.js` — no loading states, no fetch, because the data is
bundled at build time. Editing a fact means editing one file; nothing else needs to change (project
counts, CGPA, current employer badge on the hero, etc. are all derived from the data, not hardcoded
twice).

| Section | File | Notable behavior |
|---|---|---|
| Hero | `Hero/Hero.jsx` | Current-role badge auto-derived from `resume.experience.find(r => r.current)`. Stats (`projects shipped`, `internships`, etc.) computed from data length, not hand-typed. |
| Projects | `Projects/Projects.jsx`, `ProjectCard.jsx` | Modal shows `motivation` (string or structured `{problem, challenge, keyLearning}`), gold award badge if `project.award` is set, "Ask Coral" button hands a pre-filled question to the chat via `CoralContext`. |
| Skills | `Skills/Skills.jsx` | Category icons keyed by name, falls back to a default icon for any new category added to the data. |
| About | `About/About.jsx` | Strengths/weaknesses pulled from `about.js`; also the source of Coral's `funFacts`. |
| Resume | `Resume/Resume.jsx` | Renders experience, education (with `cgpa` *or* `score`), awards/achievements, and campus activities as separate blocks — all optional, only rendered if the array is non-empty. |
| Contact | `Contact/Contact.jsx` | Renders a plain (non-link) card for fields without an `href`, like location — avoids a dead-looking clickable arrow on non-actionable info. |

---

## 7. Accessibility & performance features actually implemented

- Skip-to-content link, one focus-ring recipe (`:focus-visible`) applied globally, `aria-label` on
  every icon-only control, `role="dialog"`/`aria-modal` on the chat and modals, `aria-live="polite"`
  on the chat log, `aria-current` on the active nav link, `inert` on the closed chat panel.
- Full keyboard support: Tab/Shift+Tab trapped inside open modals, Escape closes chat/mobile-menu/modal.
- `prefers-contrast: more` swaps in higher-contrast text/border tokens.
- Three.js: pixel ratio capped at 2x everywhere, particle/caustics/texture quality scaled by device
  tier, per-system frame-budget throttling independent of the render loop.
- Lazy-loading: Three.js (both the background scene and Coral's avatar) is code-split into separate
  chunks via `React.lazy`, so the initial bundle doesn't pay for 3D until it's actually needed.

---

## 8. Deployment

- **Single Vercel project** (`portfolio-pranati`), connected to the GitHub repo — every push to
  `main` auto-deploys.
- `vercel.json` declares the `api/ask.js` function explicitly (20s max duration) and sets long
  cache headers on hashed assets.
- Environment variables live only in Vercel's dashboard (`GEMINI_API_KEY`, optional `GEMINI_MODEL`,
  `CHAT_TIMEOUT_MS`), mirrored locally in a gitignored `.env.local` for `vercel dev`.
- Local dev: `npm run dev` (plain Vite — Coral runs in offline mode, `/api` doesn't exist under
  plain Vite) vs. `npx vercel dev` (also runs the serverless function, real Gemini locally).

---

## 9. Things worth knowing before editing further

- **Never pipe a secret into `vercel env add` from Windows PowerShell.** `npx` resolves to a
  `.ps1` script there, and PowerShell re-encodes anything piped into a script's stdin — it silently
  prepended a BOM (U+FEFF) to the Gemini key once, which broke every API call with an opaque
  `ByteString` encoding error at runtime, even though the key itself was valid and the source file
  was clean. Use Git Bash for any pipe carrying an exact/secret value.
- **The `.glass` + fixed-position combo needs a compound selector.** See §3. If a new fixed or
  absolute-positioned panel is added and also uses `.glass`, give it `.new-class.glass { position: … }`
  rather than relying on cascade order.
- **Don't split a lazy component across the React Three Fiber `<Canvas>` boundary.** See §5. Keep
  `<Canvas>` and everything inside it in the same lazy-loaded module.
