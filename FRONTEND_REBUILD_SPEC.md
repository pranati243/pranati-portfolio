# Frontend Rebuild Spec — Ocean Portfolio (Pranati Arun)

This document is a buildable spec for rebuilding this portfolio as a **100% frontend-only** application (no Express/MongoDB server). It captures every visual system, animation, component, and the "Coral" AI chatbot exactly as implemented in the current MERN codebase at `C:\Users\Pranati\Desktop\Portfolio`, so a rebuild can proceed section-by-section instead of from scratch.

---

## 1. Overview & Tech Stack

### 1.1 Current stack (as found)

**Root** (`package.json`): MERN monorepo — `concurrently` runs `server` (Express) + `client` (Vite/React) together. This orchestration layer is not needed in a frontend-only rebuild.

**Client** (`client/package.json`):
| Package | Version |
|---|---|
| react / react-dom | ^19.2.3 |
| react-router-dom | ^7.10.1 (installed but **not used** — app is single-page, section-based, no routes) |
| @react-three/fiber | ^9.4.2 |
| @react-three/drei | ^10.7.7 |
| three | ^0.182.0 |
| axios | ^1.13.2 (talks to the Express API) |
| vite | ^7.2.7 |
| @vitejs/plugin-react | ^5.1.2 |
| eslint / eslint-plugin-react(-hooks/-refresh) | 9.x |
| prettier | ^3.7.4 |

Note: `prop-types` is imported throughout components (`Section.jsx`, `TransparentSection.jsx`, `UnderwaterScene.jsx`, `LazyImage.jsx`, etc.) but is **not listed** in `package.json` — it must be added explicitly in a rebuild (`npm i prop-types`).

**Server** (being removed in the rebuild): Express + Mongoose + `@google/generative-ai` (Gemini) + `express-rate-limit`. See §7–8 for what it did and how to replace it.

Fonts loaded via Google Fonts `@import` in `styles/global.css`: **Inter** (300–700), **Manrope** (400–800), **Orbitron** (400–900), **Courier Prime** (400/700, used only for a legacy typewriter style reference).

Build tool: Vite, dev server on port 5173, with a dev-only proxy of `/api` → `http://localhost:5000` (`vite.config.js`). This proxy is irrelevant once the backend is gone.

### 1.2 Recommended frontend-only stack

| Concern | Recommendation |
|---|---|
| Framework/build | Vite + React 19 (keep — no backend dependency exists in the build tool itself) |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` (keep as-is, these are pure client-side WebGL) |
| Routing | Drop `react-router-dom` entirely (it's currently unused — single page with anchor-scroll sections) or keep only if you want shareable per-section URLs via `#hash` |
| Data | Replace MongoDB-backed REST endpoints with **static JSON/JS modules** bundled into the client (see §11) |
| Chatbot | **Decided (see §8.1)**: real Gemini calls via a Vercel serverless function (`/api/ask.js`) as a key-hiding proxy — no MongoDB |
| Styling | Keep CSS Modules + hand-written CSS custom properties (no need for Tailwind/styled-components — current system is copy-paste ready) |
| Deployment | **Decided**: single Vercel project (static build + `/api` serverless functions deployed together, one command, one URL) |
| prop-types | Add explicitly (currently used without being declared) |

---

## 2. Design System

### 2.1 Color palette

All colors are defined as CSS custom properties across three files: `client/src/styles/variables.css`, `client/src/styles/ocean-theme.css`, and `client/src/styles/global.css`. They overlap heavily (ocean-theme.css restates similarly named variables) — a rebuild should consolidate into one variables file.

**Core ocean palette (`variables.css`, `:root`)**

| Variable | Value | Usage |
|---|---|---|
| `--ocean-surface-blue` | `#E6F3FF` | Light-mode gradient top |
| `--ocean-primary-blue` | `#3B82F6` | Primary brand blue (buttons, links, accents) |
| `--ocean-deep-navy` | `#0B1C2D` | Deep background / dark mode base |
| `--ocean-accent-cyan` | `#38BDF8` | Cyan accent — glows, highlights, Coral theme color |
| `--ocean-light-blue` | `#60A5FA` | Secondary blue |
| `--ocean-text-primary` | `#1E293B` | Light-mode body text |
| `--ocean-text-secondary` | `#64748B` | Light-mode secondary text |
| `--ocean-border` | `#E2E8F0` | Light-mode borders |
| `--ocean-card-bg` | `rgba(255,255,255,0.8)` | Card background (light) |
| `--ocean-shadow` | `rgba(59,130,246,0.15)` | Card shadow tint |
| `--ocean-mode-gradient-start/mid/end` | `#2563EB` / `#3B82F6` / `#0EA5E9` | Ocean Mode gradient stops |
| `--ocean-mode-teal` / `--ocean-mode-teal-light` | `#14B8A6` / `#5EEAD4` | Teal accents (used e.g. for project-card title text in Ocean Mode) |

**Ocean Mode transparent-container system (`variables.css`)**

| Variable | Value |
|---|---|
| `--ocean-container-bg-primary` | `rgba(10, 37, 64, 0.75)` |
| `--ocean-container-bg-secondary` | `rgba(26, 58, 92, 0.6)` |
| `--ocean-container-bg-tertiary` | `rgba(15, 45, 75, 0.5)` |
| `--ocean-container-bg-hover` | `rgba(10, 37, 64, 0.85)` |
| `--ocean-container-bg-secondary-hover` | `rgba(26, 58, 92, 0.8)` |
| `--ocean-container-border` | `rgba(56, 189, 248, 0.2)` |
| `--ocean-container-border-hover` | `rgba(56, 189, 248, 0.4)` |
| `--ocean-container-border-active` | `rgba(56, 189, 248, 0.6)` |
| `--ocean-container-blur` / `-light` / `-heavy` | `blur(15px)` / `blur(10px)` / `blur(20px)` |
| `--ocean-text-light` | `#F0FAFF` (WCAG AA on dark ocean bg) |
| `--ocean-text-secondary` (Ocean Mode) | `#B8E6FF` |
| `--ocean-text-muted` | `#8BC5E5` |
| `--ocean-glow` / `-soft` / `-intense` | `rgba(56,189,248,0.6)` / `0.3` / `0.8` |

**Opacity / shadow / z-index tokens**

```css
--ocean-opacity-light: 0.5;
--ocean-opacity-medium: 0.7;
--ocean-opacity-heavy: 0.85;
--ocean-opacity-full: 0.95;

--ocean-shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
--ocean-shadow-md: 0 4px 16px rgba(0,0,0,0.25);
--ocean-shadow-lg: 0 8px 32px rgba(0,0,0,0.3);
--ocean-shadow-glow: 0 0 20px rgba(56,189,248,0.3);
--ocean-shadow-glow-hover: 0 0 30px rgba(56,189,248,0.5);

/* Z-index layering — critical to preserve */
--z-ocean-background: 0;
--z-ocean-content: 10;
--z-ocean-ai-agent: 50;
--z-ocean-header: 100;
--z-ocean-modal: 1000;
```

**Dark mode overrides (`[data-theme="dark"]`)**

```css
--ocean-dark-bg: #0B1C2D;
--ocean-dark-surface: #1E293B;
--ocean-dark-text-primary: #F1F5F9;
--ocean-dark-text-secondary: #94A3B8;
--ocean-dark-border: #334155;
--ocean-dark-card-bg: rgba(30, 41, 59, 0.6);
--ocean-dark-shadow: rgba(59, 130, 246, 0.25);
```

**Gradients**

```css
--gradient-ocean-vertical: linear-gradient(180deg, var(--ocean-surface-blue) 0%, var(--ocean-primary-blue) 50%, var(--ocean-deep-navy) 100%);
--gradient-ocean-animated: linear-gradient(135deg, var(--ocean-primary-blue) 0%, var(--ocean-accent-cyan) 50%, var(--ocean-primary-blue) 100%);
--gradient-card-border: linear-gradient(135deg, var(--ocean-primary-blue), var(--ocean-accent-cyan));
--gradient-card-hover: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(56,189,248,0.1));
--gradient-button: linear-gradient(135deg, var(--ocean-primary-blue), var(--ocean-light-blue));
--gradient-button-hover: linear-gradient(135deg, var(--ocean-light-blue), var(--ocean-accent-cyan));
--gradient-tech-pill: linear-gradient(135deg, var(--ocean-primary-blue), var(--ocean-accent-cyan));
```

**3D scene palette (`Background/three/config.js` → `COLOR_PALETTE`)**

| Key | Value |
|---|---|
| deepWater | `#0a2540` |
| midWater | `#0a4f5c` |
| shallowWater | `#1a5f7a` |
| sunRays | `#4db8ff` |
| caustics | `#88ccff` |
| ambient | `#1a5f7a` |
| particles | `#ffffff` |
| bubbles | `#e0f7ff` |
| sand | `#c2b280` |
| seabed | `#0a4f5c` |

Fish colors used in the scene: `#38BDF8`, `#60A5FA`, `#14B8A6`, `#0EA5E9`. Coral branch colors: `#FF6B9D`, `#FFA07A`, `#FFB6C1` with `#38BDF8` polyps. Turtle: shell `#2c5c3d`, body `#4a7c59`.

### 2.2 Typography

```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-family-heading: 'Manrope', var(--font-family-primary);
--font-ocean: 'Orbitron', 'Manrope', sans-serif; /* used for Ocean Mode headings & Coral chat greeting */
```
`Courier Prime` is imported but effectively superseded — the live Coral chat text uses Orbitron/Inter, not the typewriter monospace font (see §7).

Font sizes:
```css
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem;  /* 36px */
```
Line heights: `--line-height-tight: 1.25; --line-height-normal: 1.5; --line-height-relaxed: 1.6; --line-height-loose: 1.8;`

Mobile-first heading scale (`global.css`):
- Mobile: h1 `--font-size-3xl` (30px), h2 24px, h3 20px, h4 18px
- Tablet (≥640px): h1 36px, h2 30px, h3 24px, h4 20px
- Desktop (≥1024px): h1 `3rem` (48px), h2 `2.25rem` (36px)

### 2.3 Spacing scale

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
--spacing-3xl: 4rem;    /* 64px */
--spacing-4xl: 6rem;    /* 96px */

--max-width-content: 1280px;
--nav-height: 64px;
```

### 2.4 Border radius, transitions, breakpoints

```css
--radius-sm: 0.375rem; --radius-md: 0.5rem; --radius-lg: 0.75rem;
--radius-xl: 1rem; --radius-2xl: 1.5rem; --radius-full: 9999px;

--transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);
--transition-base: 200ms cubic-bezier(0.4,0,0.2,1);
--transition-slow: 250ms cubic-bezier(0.4,0,0.2,1);
--transition-gradient: 10s ease-in-out infinite;
--transition-ocean-wave: 20s ease-in-out infinite;

--breakpoint-sm: 640px; --breakpoint-md: 768px; --breakpoint-lg: 1024px;
--breakpoint-xl: 1280px; --breakpoint-2xl: 1536px;
```

| Breakpoint | Range | Behavior notes |
|---|---|---|
| Mobile | < 640px | Ocean Mode 3D/particle background fully disabled in some places; solid gradient only; single-column grids; hamburger nav |
| Tablet | 640–1023px | Moderate animation speeds (15s gradient); 2-column project grid |
| Desktop | ≥ 1024px | Full effects, 12s gradient animation; 3-column project grid |
| Large desktop | ≥ 1440px | Slightly larger card padding |

### 2.5 Glassmorphism / glow effect system

Every "frosted glass" panel in Ocean Mode follows the same recipe — reproduce this utility class set 1:1:

```css
.ocean-container {
  background: var(--ocean-container-bg-primary);      /* rgba(10,37,64,0.75) */
  backdrop-filter: var(--ocean-container-blur);        /* blur(15px) */
  border: 1px solid var(--ocean-container-border);     /* rgba(56,189,248,0.2) */
  border-radius: var(--ocean-radius-lg);                /* 16px */
  box-shadow: var(--ocean-shadow-lg);
  transition: all var(--transition-base);
}
.ocean-container:hover {
  background: var(--ocean-container-bg-hover);
  border-color: var(--ocean-container-border-hover);
  transform: translateY(-2px);
}
```
Mobile knocks blur down to `8px`/`5px` for perf (`ocean-theme.css`), and `@supports not (backdrop-filter: blur(10px))` falls back to a near-opaque solid background (`rgba(10,37,64,0.95)`).

Radius/spacing tokens specific to Ocean Mode layout:
```css
--ocean-radius-sm: 8px; --ocean-radius-md: 12px; --ocean-radius-lg: 16px; --ocean-radius-xl: 20px;
--ocean-section-padding: 3rem 2rem;      /* desktop */
--ocean-section-padding-mobile: 2rem 1rem;
--ocean-section-max-width: 1200px;
```

---

## 3. App Structure & State

### 3.1 Composition (single page, section-based — no router)

`main.jsx` mounts: `ErrorBoundary` → `ThemeProvider` → `OceanModeProvider` → `App`.

`App.jsx` renders, inside `Layout`:
```
Section#hero      → Hero
Divider
Section#projects  → LazySection(Projects)
Divider
Section#skills    → LazySection(TabbedContent)   [Skills / About / Contact tabs]
Divider
Section#resume    → LazySection(Resume)
```
Outside `Layout` (always mounted, fixed position): `AIChat` (renders `null` unless Ocean Mode is on), a `Toast` (welcome message), and a `Tooltip` (easter eggs).

### 3.2 Context/state: Theme and Ocean Mode

Two independent boolean toggles, each backed by React Context + `localStorage`, applied as attributes on `document.documentElement`:

**`ThemeContext`** (`context/ThemeContext.jsx`)
- State `isDarkMode`, default **true** (`savedTheme !== 'light'` — dark is default).
- Effect sets/removes `data-theme="dark"` on `<html>` and persists `localStorage.theme`.
- `toggleTheme()` flips state. Triggered globally by pressing `.` (period) — see easter eggs, §9.

**`OceanModeContext`** (`context/OceanModeContext.jsx`)
- State `isOceanMode`, default **false**.
- Effect sets/removes `data-ocean-mode="enabled"` on `<html>` and persists `localStorage.oceanMode`.
- `toggleOceanMode()` flips state. Triggered by the floating `OceanToggleButton` (top-right switch, wave/list icon).

**What Ocean Mode architecturally drives** (`Layout.jsx`):
- OFF: renders `GradientBackground` (2D animated CSS gradient) + normal `Navigation` + page content directly.
- ON: hides `GradientBackground`, renders `OceanBackground` (3D/2D ocean scene, full-bleed, z-index 0), hides the normal `Navigation`, shows `OceanModeHeader` (tab bar) instead, wraps all section content in `OceanModeLayout` → each section renders through `TransparentSection` (glass panels) instead of plain `<section>`, and mounts `AIChat` (Coral) — which is **only visible in Ocean Mode**.
- Ocean Mode ON with no scroll shows a centered overlay: "WELCOME TO THE DEPTHS / Meet Coral, Your Ocean Guide / Click the glowing orb to begin your journey" (Orbitron font, cyan glow text-shadow).

Every content component (`About`, `Skills`, `Contact`, `Resume`, `Projects`) branches on `isOceanMode` to pick between plain `<section>` markup and a `TransparentSection` wrapper — reproduce this dual-render pattern per component in the rebuild, or better, centralize it in one wrapper component that all sections use unconditionally.

### 3.3 Z-index layering contract (must preserve)

```
0    Ocean background (3D canvas / 2D canvas / gradient)
10   Section content
50   AI agent orb (Coral)
100  Header / navigation
1000 Modals / full-screen chat panel (chat panel itself uses 999)
```

---

## 4. Ocean Background & Particle/Bubble System

This is the visual centerpiece. There are actually **three independent background implementations** that form a fallback chain, selected by `OceanBackground.jsx`:

```
isOceanMode === false  →  GradientBackground (2D CSS gradient, always-on default bg)
isOceanMode === true   →  OceanBackground orchestrator:
                             try  ThreeOceanBackground (WebGL / react-three-fiber)
                             catch → CanvasOceanBackground (2D <canvas> procedural ocean)
                             (ThreeOceanBackground itself further falls back to
                              InteractiveOcean, a pure-CSS bubble/wave layer,
                              if WebGL context is lost or R3F throws)
```

### 4.1 GradientBackground (always-on default, non-Ocean-Mode)

`components/Background/GradientBackground.jsx` + `.module.css`. Fixed, full-viewport, `z-index: -2`, `pointer-events: none`. Two layers:
1. `.gradientLayer` — a `linear-gradient(180deg, ...)` sized `100% 200%`, animated via `background-position` keyframes (`gradientShift`), looping every **12s desktop / 15s tablet / disabled on mobile**.
   ```css
   background: linear-gradient(180deg,
     var(--ocean-surface-blue) 0%, #B8DCFF 25%,
     var(--ocean-primary-blue) 60%, var(--ocean-deep-navy) 100%);
   background-size: 100% 200%;
   animation: gradientShift 12s ease-in-out infinite;
   ```
   Dark mode and Ocean-Mode-without-3D variants swap in different stop colors (see file for exact `.dark .gradientLayer` / `.oceanMode .gradientLayer` rules).
2. `.heroGlow` — a large (`800×400px` desktop `1000×500px`) radial gradient positioned behind the hero text at `top: 15%`, opacity intentionally **under 6%** (`rgba(56,189,248,0.05)` core) so it reads as a subtle glow, not a shape.

`gradientShift` keyframes (`animations.css`):
```css
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
```
Respects `prefers-reduced-motion` (animation removed, gradient frozen) and detects mobile via a throttled `resize` listener (`window.innerWidth < 640`) to strip the animation entirely rather than relying on CSS media queries alone.

### 4.2 CanvasOceanBackground (2D canvas fallback — no GPU required)

`components/Background/CanvasOceanBackground.jsx`. Pure `<canvas>` + `requestAnimationFrame` loop, no WebGL. This is the algorithm to reproduce for a lightweight fallback tier:

**Setup:**
- Canvas resized to `window.innerWidth/innerHeight` on mount and on `resize`.
- **3 wave objects**: `{ amplitude: 30/25/20, frequency: 0.002/0.0025/0.003, speed: 0.0005/0.0007/0.0009, offset: 0/π/2/π, y: height*0.7/0.75/0.8 }`.
- **50 particles** (bubbles/light spots): random `x,y`, `radius` 1–4px, `speedY` 0.2–0.7, `speedX` ±0.15, `opacity` 0.2–0.7.
- **5 caustic light rays**: evenly spaced at `width/6 * i`, `width: 80px`, `height: 60% of viewport`, each swaying via its own sine phase.

**Per-frame draw order** (`animate()`, called via `requestAnimationFrame`):
1. Fill whole canvas with a 3-stop vertical `createLinearGradient` (`rgba(56,189,248,0.25)` → `rgba(59,130,246,0.35)` → `rgba(14,165,233,0.45)`).
2. Draw each light ray as a vertical gradient rect that sways horizontally: `swayOffset = sin(ray.sway += swaySpeed) * 30`.
3. Update + draw each particle: move `y -= speedY`, `x += speedX`; wrap `y` back to `height+10` when it exits the top, wrap `x` left/right; draw as a `createRadialGradient` glow (white core → cyan → transparent) with radius `= particle.radius * 6` — i.e. every particle renders as a soft glowing orb, not a hard dot.
4. Draw each wave as a filled path: for `x` from `0` to `width` step `5`, `y = wave.y + sin(x*frequency + time*speed + offset) * amplitude`; fill with a vertical gradient (`rgba(59,130,246,α)` → `rgba(56,189,248,1.3α)` → `rgba(14,165,233,1.6α)`) plus a `2px` stroke outline for definition.

```js
// core wave path formula, reusable verbatim
for (let x = 0; x <= width; x += 5) {
  const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;
  ctx.lineTo(x, y);
}
```
`time` increments by `1` every animation frame (not delta-time based — frame-count based, so speed is tied to actual FPS).

### 4.3 InteractiveOcean (pure-CSS fallback layer)

`components/Background/InteractiveOcean.jsx` + `.module.css`. No canvas/JS animation loop at all — just DOM elements + CSS `@keyframes`. Used (a) as the Suspense fallback while the 3D Canvas is loading, and (b) as `standalone` full fallback if Three.js throws.

- **3 wave divs** (`.ocean_wave.wave_1/2/3`): `width: 200%`, `height: 200px`, linear gradient (transparent → `rgba(56,189,248,0.3)` → `rgba(59,130,246,0.5)`), `border-radius: 50%`, animated via `wave-motion` (10s/12s/14s, staggered 0/2s/4s delay, opacity 0.7/0.5/0.3):
  ```css
  @keyframes wave-motion {
    0%,100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
    50%     { transform: translateX(-25%) translateY(-30px) rotate(3deg); }
  }
  ```
- **5 bubble divs** (`.bubble_1`–`.bubble_5`): sizes 15–35px, `left` 10/30/50/70/90%, radial gradient white-to-cyan fill with an inset highlight + outer glow shadow, each with its own `animation-delay` (0/1/2/3/4s) and `animation-duration` (7–11s). Rise animation:
  ```css
  @keyframes bubble-rise {
    0%   { bottom: -50px; opacity: 0; transform: translateX(0) scale(1); }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { bottom: 110%; opacity: 0; transform: translateX(100px) scale(1.5); }
  }
  ```
  (A near-identical, slightly smaller-drift version of this keyframe also lives globally in `styles/oceanAnimations.css` as `bubbleRise`, and a third copy — with `translateX(20px)` — animates the loading-spinner bubbles in `OceanLoader.module.css`. All three are the same visual language: reproduce as one shared keyframe.)

### 4.4 ThreeOceanBackground — the 3D scene (react-three-fiber)

`components/Background/ThreeOceanBackground.jsx` sets up the R3F `<Canvas>`:
- Camera: `fov 75, near 0.1, far 1000, position [0,0,10]`.
- `gl` options: `alpha: false, antialias: <perf-dependent>, powerPreference: <perf-dependent>, failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false, stencil: false, depth: true, premultipliedAlpha: false`.
- `dpr` capped at `getPixelRatio(2)` (never renders above 2x device pixel ratio, even on 3x/4x phones).
- Wrapped in a custom `ThreeErrorBoundary` (class component) — on any render error, falls back to `<InteractiveOcean standalone />`. Also listens for `webglcontextlost`/`webglcontextrestored` DOM events on the canvas and forces the 2D fallback on context loss.
- Shows `NewOceanLoader` (see §6) while `!isReady` (a hard-coded 3.5s delay after mount before the canvas is considered ready) or while `Suspense` is resolving.

Inside the Canvas, `UnderwaterScene.jsx` composes the whole scene:

```jsx
<color attach="background" args={['#0a2540']} />
<InteractiveCamera />
<fog attach="fog" args={[FOG_CONFIG.color, FOG_CONFIG.near, FOG_CONFIG.far]} /> {/* '#0a2540', near 10, far 50 */}
<Lighting />
<OceanFloor enableAnimations={...} />
{enableCaustics && <CausticsEffect enableAnimations={...} intensity={0.4} />}
<ParticleSystem particleCount={...} enableAnimations={...} />
{enableAnimations && <>
  {/* 7 SwimmingFish, 7 FloatingJellyfish, 7 CoralReef, 1 SwimmingTurtle — hard-coded positions, see below */}
</>}
```

#### 4.4.1 Lighting (`three/Lighting.jsx`)
```jsx
<ambientLight color="#1a5f7a" intensity={0.4} />
<directionalLight color="#4db8ff" intensity={0.8} position={[10, 20, 10]} castShadow={false} />
```
(Config also defines two optional point lights at `#66d9ff`/`#88eeff`, `intensity` 0.3/0.2 — present in `config.js` `LIGHTING_CONFIG.pointLights` but **not actually wired into the `Lighting` component** — a rebuild can add them for extra depth or ignore them, matching current behavior.)

#### 4.4.2 OceanFloor (`three/OceanFloor.jsx`)
- `PlaneGeometry(100, 100, 64, 64)` rotated `-90°` on X, positioned `y: -10`.
- `MeshStandardMaterial` color `#0a4f5c`, `roughness: 0.8`, `metalness: 0.2`, `DoubleSide`.
- Animated vertex displacement using a **hand-rolled 2D Simplex noise** class (Stefan Gustavson algorithm, embedded directly in the file — no external noise library dependency). Each frame (rate-limited to 15 FPS via a manual timestamp check), every vertex's Z is recomputed as `simplex.noise(x*0.05 + t, y*0.05 + t*0.8) * 0.5`, then `computeVertexNormals()` is called for correct lighting. `t` accumulates at `delta * 0.2` (slow drift).

#### 4.4.3 ParticleSystem (`three/ParticleSystem.jsx`) — the "bubbles"
This is the primary bubble/debris/plankton effect in 3D mode. Config from `PARTICLE_CONFIG`:
```js
count: { desktop: 2000, tablet: 1500, mobile: 1000 }  // overridden by getPerformanceConfig()
size: { min: 0.05, max: 0.15 }
opacity: { min: 0.3, max: 0.6 }
bounds: { x: [-50,50], y: [-20,20], z: [-50,50] }
animation: { verticalSpeed: 0.02, horizontalSpeed: 0.01, rotationSpeed: 0.005, swayAmplitude: 2 }
```
Implementation: a single `THREE.Points` object using `BufferGeometry` with `position`/`size`/`opacity` attributes, and `PointsMaterial` with `size: 0.1, color: '#ffffff', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true` — additive blending is what makes overlapping particles glow brighter, giving the underwater "sparkle" look.

Per-particle init: random position in bounds, random size/opacity, random velocity (`vy` biased upward `0.5–1.5`, `vx`/`vz` `±0.5`), random phase for sine offset (prevents synchronized bobbing).

Per-frame update (rate-limited to 30 FPS):
```js
positions[i3+1] += animation.verticalSpeed * velocities[i3+1] * delta * 60;   // rise
const swayX = Math.sin(time*animation.horizontalSpeed + phases[i]) * animation.swayAmplitude;
const swayZ = Math.cos(time*animation.horizontalSpeed + phases[i]) * animation.swayAmplitude;
positions[i3]   += swayX * delta * 60 * 0.01;
positions[i3+2] += swayZ * delta * 60 * 0.01;
// wrap top->bottom on Y; bounce (invert velocity) on X/Z bounds
pointsRef.current.rotation.y += animation.rotationSpeed * delta; // whole system slowly rotates
```

#### 4.4.4 CausticsEffect (`three/CausticsEffect.jsx`)
Simulated underwater light-refraction pattern projected onto the ocean floor. Not a real caustics shader — a **procedurally generated canvas texture**: `generateCausticsTexture(512)` draws 20 random radial-gradient blobs (white → transparent, opacity 0.2–0.5) plus 10 random wavy connecting strokes onto an offscreen `<canvas>`, converts it to a `THREE.CanvasTexture` with `RepeatWrapping`. Applied to a `PlaneGeometry(100,100)` positioned just above the ocean floor (`y: -9.9`) with `MeshStandardMaterial` (`color: '#88ccff'`, `AdditiveBlending`, `depthWrite: false`).

Animated (rate-limited to 20 FPS) by offsetting/rotating the texture's UV, not by moving geometry:
```js
causticsTexture.offset.x = Math.sin(t * 0.05) * 0.1;
causticsTexture.offset.y = t * 0.05 * 0.5;
causticsTexture.rotation = Math.sin(t * 0.02) * 0.1;
```
`intensity` default `0.4`; automatically **disabled entirely on mobile and low-memory devices** (see §4.6).

#### 4.4.5 Sea creatures
All creatures use simple primitive geometries (spheres/cones/cylinders/boxes) with `emissive` materials for a glowing, stylized look — not textured models.

**SwimmingFish** (`three/SwimmingFish.jsx`) — body = small sphere, tail = cone, `emissiveIntensity 0.2–0.3`, `metalness 0.6`. Motion: figure-8 path `x = pos.x + sin(t*0.5)*3`, `y = pos.y + sin(t*0.3)*1.5`, `z = pos.z + cos(t*0.5)*3`, with `lookAt()` toward the direction of travel and a tail-wag rotation `sin(t*8)*0.3` on the tail mesh.

**FloatingJellyfish** (`three/FloatingJellyfish.jsx`) — translucent dome (`sphereGeometry` half-sphere, `opacity 0.7`, `emissive #38BDF8`) + 6 cylindrical tentacles arranged radially. Bob: `y = pos.y + sin(t)*0.5`; slow horizontal drift `x = pos.x + sin(t*0.3)*0.3`; pulsing scale `1 + sin(t*2)*0.1`; tentacles individually sway `sin(t*3+i)*0.2` on Z rotation.

**CoralReef** (`three/CoralReef.jsx`) — 3 cylindrical "branches" (colors `#FF6B9D`, `#FFA07A`, `#FFB6C1`) + 5 small emissive polyps (`#38BDF8`) arranged in a circle on top. Gentle per-branch sway: `rotation.z = sin(t + i*0.5) * 0.1`.

**SwimmingTurtle** (`three/SwimmingTurtle.jsx`) — shell (squat cylinder, `#2c5c3d`), head (sphere, `#4a7c59`), 4 flat box flippers. Slow wide circular path (`sin/cos(t*0.2)*5` on x/z), flipper-flap animation via alternating Z-rotation per flipper (`sin(t*2)*0.5`, mirrored front/back and left/right).

**UnderwaterScene distribution** (exact hard-coded positions used — reproduce to match the current "spread across the whole viewport" layout):
```jsx
// Fish (7)
<SwimmingFish position={[-4,0,-4]} speed={0.8} color="#38BDF8" />
<SwimmingFish position={[-3,0.5,-4.5]} speed={0.9} color="#60A5FA" />
<SwimmingFish position={[-4.5,-0.3,-3.8]} speed={0.7} color="#38BDF8" />
<SwimmingFish position={[4,1,-5]} speed={1.1} color="#14B8A6" />
<SwimmingFish position={[5,0.8,-5.5]} speed={1.0} color="#0EA5E9" />
<SwimmingFish position={[0,-1,-7]} speed={0.9} color="#60A5FA" />
<SwimmingFish position={[-1,1.5,-6]} speed={0.85} color="#38BDF8" />

// Jellyfish (7)
<FloatingJellyfish position={[-4,2,-3]} speed={0.5} />
<FloatingJellyfish position={[4.5,2.5,-4]} speed={0.6} />
<FloatingJellyfish position={[0,3,-6]} speed={0.4} />
<FloatingJellyfish position={[-2,1.5,-5]} speed={0.55} />
<FloatingJellyfish position={[2.5,2.8,-5.5]} speed={0.45} />
<FloatingJellyfish position={[-5,2.2,-6]} speed={0.5} />
<FloatingJellyfish position={[5.5,1.8,-6.5]} speed={0.6} />

// Coral reefs (7)
<CoralReef position={[-4,-2.5,-4]} />  <CoralReef position={[4,-2.5,-5]} />
<CoralReef position={[0,-2.5,-6]} />   <CoralReef position={[-5.5,-2.5,-6.5]} />
<CoralReef position={[5.5,-2.5,-6]} /> <CoralReef position={[-2,-2.5,-7]} />
<CoralReef position={[2.5,-2.5,-7.5]} />

// Turtle (1, background)
<SwimmingTurtle position={[0,1,-10]} />
```

#### 4.4.6 InteractiveCamera (`three/InteractiveCamera.jsx`)
Camera parallax + scroll response, all via `useFrame` + `lerp` (no external tween library):
- Mouse: normalized to `[-1,1]` on move; maps to camera rotation `±5°` max (`degToRad(5)`), `lerpFactor 0.05`.
- Scroll: page scroll percent (`0–1`) maps camera `z` between `8` and `12` (`CAMERA_CONFIG.scroll.minZ/maxZ`), `lerpFactor 0.05`.
- Respects `prefers-reduced-motion` — resets target rotation/z to defaults and stops responding to input when active.
- Every frame: `camera.lookAt(0,0,0)` is force-called after applying interpolated rotation/z, so the scene always centers on the origin.

### 4.5 Fallback chain summary (must reproduce this exact cascade)

```
GradientBackground        (Ocean Mode OFF — always this)
        │
        ▼ (Ocean Mode ON)
OceanBackground.jsx tries WebGL:
        │
        ├─ WebGL OK → ThreeOceanBackground
        │                 │  wrapped in ThreeErrorBoundary + Suspense
        │                 ├─ loading → NewOceanLoader
        │                 ├─ webglcontextlost event → InteractiveOcean (standalone)
        │                 └─ render throws → InteractiveOcean (standalone)
        │
        └─ WebGL unsupported → CanvasOceanBackground (2D procedural canvas)
```
Note the current code in `OceanBackground.jsx` is written to **always force-attempt 3D** (`setWebGLSupported(true); setUse3D(true)` unconditionally, with a comment "let Three.js try, ErrorBoundary will catch failures") rather than gating on `isWebGLSupported()` up front — real WebGL detection happens only for diagnostics/logging. A rebuild can choose to gate more conservatively (check `isWebGLSupported()` before ever mounting the Canvas) or keep this "always try, catch failures" approach; both are valid, but the fallback destinations above must be preserved.

### 4.6 Performance tiers & device detection

`utils/deviceDetection.js` → `getPerformanceConfig()` produces the config object every 3D component reads:

```js
// Base (desktop)
{ particleCount: 2000, enableCaustics: true, enableShadows: false, antialias: true,
  powerPreference: 'high-performance', enablePostProcessing: false, shadowQuality: 'off',
  textureResolution: 1024, enableAnimations: !prefersReducedMotion }

// Mobile overrides (isMobileDevice() via UA sniff /iPhone|iPad|iPod|Android/i)
{ particleCount: 1000, enableCaustics: false, antialias: false,
  powerPreference: 'low-power', textureResolution: 512 }

// Tablet overrides (UA sniff OR 768–1024px width)
{ particleCount: 1500, enableCaustics: true, antialias: true,
  powerPreference: 'default', textureResolution: 768 }

// Low-memory devices (navigator.deviceMemory < 2, or fallback estimate: mobile=2GB, tablet=3GB, desktop=4GB)
particleCount *= 0.5; enableCaustics = false; textureResolution = 256;

// prefers-reduced-motion
enableAnimations = false;
```
Pixel ratio is always capped: `getPixelRatio(2) = Math.min(devicePixelRatio, 2)`.

`utils/webglDiagnostics.js` provides `diagnoseWebGL()` — tests both `webgl` and `webgl2` contexts, extracts `WEBGL_debug_renderer_info` (renderer/vendor strings), flags software-rendering fallbacks, and produces human-readable recommendations (update drivers, enable hardware acceleration, etc.) — used purely for console diagnostics/`BackgroundDebugInfo` overlay, not for gating logic.

`hooks/usePerformanceMonitor.js` + `utils/performanceUtils.js` provide a **separate**, coarser CSS-level performance tier (`'high'|'medium'|'low'`), computed from a weighted score of `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `navigator.connection.effectiveType`, and mobile UA — applied once on app mount as `document.documentElement.setAttribute('data-performance', level)`. This attribute drives blur/shadow/animation CSS rules globally (`global.css`, `ocean-theme.css`) independent of the Three.js-specific config above — i.e. there are **two parallel performance systems** (one for 3D params, one for CSS effects); reproduce both if full fidelity is wanted, or unify them in the rebuild.

Frame-rate limiting pattern used throughout the 3D layer (particles 30fps, caustics 20fps, ocean floor 15fps) — each component keeps its own `lastUpdateTimeRef` and skips the expensive per-vertex work if `elapsedTime*1000 - lastUpdateTimeRef < updateIntervalMs`, while still letting cheap operations (like whole-group rotation) run every frame for smoothness.

### 4.7 Reduced motion & accessibility for the ocean scene

- `ACCESSIBILITY_CONFIG` (`three/config.js`): on reduced motion, caustics and camera animation are disabled outright; particles are kept but their movement speed is cut to 30% (`reduceAnimationSpeed: 0.3` — though note this multiplier is defined in config but the actual particle/ocean-floor components currently gate on the coarser `enableAnimations` boolean rather than reading this specific ratio; a rebuild can wire it in for finer control).
- Canvas/scene root has `aria-hidden="true"` and `role="presentation"` — the entire 3D layer is decorative and invisible to screen readers.
- `client/src/components/Background/README.md` documents the intended responsive contract: GradientBackground fully static + no animation on mobile; OceanBackground (Ocean Mode) is meant to be **completely disabled on mobile** per the design doc, though the shipped `OceanBackground.jsx` doesn't hard-gate on viewport width itself (it relies on the device-tier particle/caustics reduction instead) — worth deciding explicitly in a rebuild.

---

## 5. Component-by-Component Breakdown

### 5.1 Hero (`components/Hero/Hero.jsx`)
- Renders its own `GradientBackground` instance directly (in addition to the one in `Layout`).
- Content, in order, each wrapped in `FadeInSection` (slide-up, staggered `delay` 0/100/200/300/400ms, `threshold 0.2`):
  1. `h1.greeting`: "Hi, I'm **Pranati Arun**" — the name span has a hover state (`nameHovered`) that triggers an animated gradient-text shimmer (`background: linear-gradient(90deg, primary, cyan, primary); background-size:200% auto; -webkit-background-clip:text;` animated via `background-position`) plus an animated underline that thickens/pulses on hover.
  2. `p.role`: "Software Engineering Student" (cyan, `--font-size-2xl`, bold).
  3. `p.intro`: one-line blurb.
  4. CTA button row (`nav.ctaButtons`, 3 buttons): **View Projects** (primary, scrolls to `#projects`), **Resume** (secondary, scrolls to `#resume` — does *not* trigger a download), **Ask Me Anything** (secondary, opens `CoralDirectionalAnimation`, an arrow+message-box overlay pointing at the Ocean Mode toggle — it does *not* open the chat directly, it nudges the user to enable Ocean Mode first).
  5. `OceanMessageBox`: a small glass panel below the CTAs — "For an immersive experience 🌊, press the toggle to go to the **Ocean Mode**, to chat with my AI Assistant Coral about my projects, skills, and more!"
- Mobile: CTA buttons stack full-width; `.greeting` drops to `--font-size-3xl`.

### 5.2 Navigation (`components/Navigation/Navigation.jsx` + `OceanModeHeader.jsx` + `MobileMenu.jsx`)
Two entirely different nav bars depending on mode:

**Normal mode — `Navigation.jsx`**: fixed top bar, `height: var(--nav-height)` (64px), glassmorphic (`rgba(255,255,255,0.7)` + `blur(10px)`, darkens to `rgba(255,255,255,0.85)` after `scrollY > 20`). Logo button scrolls to top. Links: Projects / Skills / About / Contact (About/Skills/Contact all dispatch a custom `activateTab` window event to select the right tab inside `TabbedContent`, then scroll to `#skills`) + a separate Resume link. Active-link tracked via `useScrollSpy` (IntersectionObserver-based, 100px offset) with an animated gradient underline (`scaleX` transform). Theme toggle sun/moon SVG button. Hamburger (3-line) button appears < 768px, opens `MobileMenu` (slide-in panel with backdrop, ESC/backdrop-click to close, body-scroll-lock while open).

**Ocean Mode — `OceanModeHeader.jsx`**: replaces `Navigation` entirely. Fixed horizontal pill/tab bar (`role="tablist"`), 5 tabs: Projects, Skills, Contact, About, Resume — order differs from normal nav. Active tab computed via `useScrollSpy` with a dynamically calculated offset (`navHeight 60 + headerHeight 70 + padding 20 = 150px` default). Full roving-tabindex keyboard support (arrow keys move focus between tabs, Enter/Space activates). On mobile, the active tab auto-scrolls into horizontal view (`scrollIntoView({inline:'center'})`).

### 5.3 About (`components/About/About.jsx`)
Fetches `fetchAbout()` on mount (currently the `/api/about` REST call — replace with static import, see §11). Renders: bio paragraph, "What I'm Into" interests list (`<ul>`), "My Learning Journey" mindset paragraph. Supports 3 render modes via props/context: `inTab` (bare, no heading, used inside `TabbedContent`), Ocean Mode (`TransparentSection` wrapper), default (plain `<section>`). Uses `OceanLoader` while loading, an `alert`-role error div on failure.

### 5.4 Skills (`components/Skills/Skills.jsx` + `SkillTag.jsx`)
Fetches `fetchSkills()` → object keyed by category (`Frontend`/`Backend`/`Database`/`Tools`/`Other` per the `Skill` Mongoose enum). Renders one `FadeInSection`-wrapped category block per key, each with an `h3` category title and a `role="list"` of `SkillTag` pill components (`role="listitem"`, `tabIndex="0"`, hover/focus scale). Same triple-render-mode pattern as About.

### 5.5 Projects (`components/Projects/Projects.jsx` + `ProjectCard.jsx` + `ProjectModal.jsx`)
Fetches `fetchProjects()`. **Deliberately holds the loading spinner for a minimum of 3000ms** even if the fetch resolves instantly (`minDisplayTime = 3000`, `Math.max(0, minDisplayTime - elapsed)` delay) — an intentional UX pacing choice worth preserving or dropping consciously in the rebuild (with static data, a real fetch delay no longer exists, so this artificial delay becomes the *only* thing producing the loader — decide if that's still desired).

`ProjectCard`: glassmorphic card (`--ocean-card-bg` light / `rgba(26,58,92,0.6)` Ocean Mode), gradient border that fades in on hover via a masked pseudo-element, `translateY(-8px)` lift on hover, tech-stack pill chips (`--gradient-tech-pill`), 3 action buttons — **Demo** (if `demoUrl` present, opens new tab), **GitHub** (opens new tab), **Why I Built This** (opens `ProjectModal`). Ocean Mode adds an animated shimmer sweep (`::after`, `background-position` keyframe) and a pulsing glow box-shadow (`oceanGlow` keyframe) on hover.

`ProjectModal`: uses the shared `Modal` component; shows `project.motivation` — either a plain string, or (preferred) a structured object with `problem` / `challenge` / `keyLearning` fields, each rendered as its own titled section.

Grid: 1 col mobile / 2 col tablet / 3 col desktop (`role="list"` of `FadeInSection`-staggered cards, `delay = index * 100`).

### 5.6 TabbedContent (`components/TabbedContent/TabbedContent.jsx`)
Hosts Skills / About Me / Contact as `role="tablist"` tabs (each with an inline SVG icon), default active = `skills`. Listens for the `activateTab` `CustomEvent` dispatched by `Navigation` so external links can jump straight to a specific tab. Full keyboard support (`ArrowLeft/Right/Home/End`, focus follows selection). Children are only mounted when their tab is active (`{activeTab === 'skills' && <Skills inTab />}`) — i.e. inactive tab content unmounts rather than just hiding, so each tab's data-fetch effect re-runs on every activation (worth noting: with static data in the rebuild this becomes free, no re-fetch cost).

### 5.7 Resume (`components/Resume/Resume.jsx`)
Fetches both `fetchResume()` (structured content: summary/education/experience/certifications) and `getResumeUrl()` (a URL to the actual PDF — falls back to `/resume.pdf` in `public/`). Renders Summary → Education list → Experience list (with responsibilities sub-list) → Certifications list, each in its own `FadeInSection` (staggered 100–500ms). A **Download Resume** button creates a temporary `<a download>` link and clicks it programmatically to trigger the PDF download (suggested filename `Pranati_Arun_Resume.pdf`). Same Ocean-Mode/default dual-render split as other sections (note: the non-Ocean-Mode branch references `resumeData` without a loading guard around every field access — effectively assumes `resumeData` is present once `!loading`, a latent bug worth fixing in the rebuild by guarding on `resumeData &&` explicitly in both branches).

### 5.8 Contact (`components/Contact/Contact.jsx`)
Also fetches from `fetchAbout()` (contact fields live on the About/portfolio-owner record: `email`, `phone`, `github`, `linkedin`) — normalizes both a nested `contact: {...}` shape and flat top-level fields for backward compatibility. Renders a welcome paragraph + a `nav` of icon links (inline SVGs): Email (`mailto:`), Phone (`tel:`, optional), GitHub (new tab), LinkedIn (new tab). Same `inTab`/Ocean/default triple-mode pattern.

### 5.9 Layout family (`components/Layout/*`)
- `Layout.jsx` — top-level shell described in §3.2.
- `OceanModeLayout.jsx` — thin wrapper that, only when Ocean Mode is active, adds a `.oceanModeLayout > .oceanContent` div pair to establish the stacking context described in §3.3; otherwise a no-op passthrough.
- `Section.jsx` — generic non-Ocean-Mode section wrapper: `<section id className><div class="container">{children}</div></section>`, with a `variant` prop (`default`/`hero`/`compact`) and optional visual `<div class="separator">` when `withSeparator`.
- `TransparentSection.jsx` — the Ocean Mode equivalent of `Section`: when Ocean Mode is off, renders children plus an optional `<h2>` title with no extra wrapper; when on, wraps in the glassmorphic `.transparentSection > .container > (title + .content)` structure. This is the component every content section (`About`, `Skills`, `Contact`, `Resume`, `Projects`) delegates to for its Ocean-Mode rendering.

### 5.10 Buttons & shared primitives (`components/common/*`)
- `Button.jsx` — variant (`primary`/`secondary`) + size (`small`/`medium`/`large`) prop-driven button with a **Material-style ripple effect**: on click, computes a `span.ripple` positioned/sized from click coordinates and the larger of `button width/height`, appends it, removes it after 600ms (matches the `ripple` keyframe duration in `animations.css`).
- `Modal.jsx` — overlay + centered panel, ESC-to-close, body-scroll-lock while open, `role="dialog" aria-modal="true"`.
- `Toast.jsx` / `Tooltip.jsx` — auto-dismissing notices (`duration` prop, default 3000ms/2000ms), `role="alert"`/`role="tooltip"`.
- `Divider.jsx` — the horizontal rule between page sections (see `styles/oceanAnimations.css`/global for the gradient-line styling reused as `.ocean-divider`).
- `LazyImage.jsx` / `LazySection.jsx` — IntersectionObserver-gated rendering (§10).

---

## 6. Loaders, Transitions, and Micro-Interactions

| Component | Effect | Mechanism |
|---|---|---|
| `OceanLoader.jsx` | Cute inline SVG fish that swims side-to-side/up-down and flips horizontally (`fishSwim`, 3s), 3 layered translucent "waves" rising underneath (`waveRise`, 2s, staggered 0.3s/0.6s delays), 5 bubbles rising with fade in/out (`bubbleRise`, 3–4s, staggered), gradient-text "Loading..." label pulsing. All pure CSS `@keyframes`, respects `prefers-reduced-motion` (removes animations, freezes fish, dims bubbles to 0.5 opacity). Used as the general in-page loading spinner (About/Skills/Contact/Resume/Projects while fetching). |
| `NewOceanLoader.jsx` | 8 concentric "dot" rings that scale/rotate in a 3D perspective tunnel effect (`perspective: 600px`, each dot `border: 20px solid`, animated `rotateX/rotateY/translateZ/scale` over 3s, staggered 200ms apart, `cubic-bezier(.67,.08,.46,1.5)` easing) on a dark `#0d1a26` background. Used specifically while the **3D Three.js canvas** is initializing (`ThreeOceanBackground`'s Suspense fallback and the `!isReady` gate). Sourced from Uiverse.io (credited in the CSS comment). |
| `CoralDirectionalAnimation` | Full-screen dim overlay (click-to-dismiss) with a floating message box ("Psst! Over here! / Toggle the wave to dive in.") anchored top-right, an animated arrow icon pointing up-right (`point-up-right`, 2s), and 3 decorative SVG coral shapes swaying (`sway`, 8–15s, staggered) behind it at low opacity. Triggered by Hero's "Ask Me Anything" button — nudges the user toward the Ocean Mode toggle rather than opening chat directly. |
| `OceanToggleButton.jsx` | The Ocean-Mode on/off switch — a pill-shaped toggle with a sliding knob containing either a "home" icon (off) or a "waves" icon (on); fixed top-right, always mounted (rendered by `Layout` regardless of mode). |
| `FadeInSection.jsx` | The universal scroll-reveal wrapper — `useIntersectionObserver` (`triggerOnce: true`) + a `delay`-driven `setTimeout` before adding a `.visible` class that triggers the CSS `fadeInUp`/`fadeIn` transition. Used on virtually every content block across every section, with staggered `delay` props (typically `index * 100`ms) to create cascading reveal effects. |
| Ripple (`Button.jsx`) | Material-style expanding-circle click feedback, computed from click coordinates, `ripple` keyframe (`scale(0)→scale(4)`, `opacity 0.08→0`), 600ms. |
| Name shimmer (Hero) | Gradient-text background-position animation on hover, `2s linear infinite`, plus an underline that thickens and pulses. |
| Card shimmer (Ocean Mode ProjectCard) | Diagonal light sweep across the card on hover (`background-position -100%→200%`, 2s) plus a pulsing glow box-shadow (`oceanGlow`, 2s infinite while hovered). |

**Global keyframe library** worth carrying over verbatim (`styles/animations.css` + `styles/oceanAnimations.css`): `gradientShift`, `oceanDrift`, `oceanWave`, `waveMove1/2`, `lightRays`, `float`, `pulse`, `rotate`, `fadeInUp`, `shimmer`, `ripple`, `slideInRight/OutRight`, `fadeIn/Out`, `scaleIn/Out`, `glowPulse`, `oceanPulse`, `bubbleRise`, `fishSwim`, `waveFloat`.

---

## 7. The AI Chatbot ("Coral") — Current Architecture

### 7.1 UI/UX flow

Coral is **only rendered when Ocean Mode is active** (`AIChat.jsx` returns `null` otherwise). Two pieces are always mounted together: `ChatPanel` (the full-screen overlay, conditionally visible) and `GlowingAIAgent` (the floating orb button that toggles it).

**Entry point — `GlowingAIAgent`** (`components/AIChat/GlowingAIAgent.jsx`): fixed `bottom:50px; right:50px` (mobile: `20px/20px`, size 60px vs 80px desktop), a layered-glow circular button:
- `.glowOuter` / `.glowMiddle` — two nested radial-gradient halo layers (`inset:-20px`/`-12px`), each independently pulsing.
- `.orb` — main sphere: `radial-gradient(circle at 30% 30%, cyan → blue → dark-blue)` with a 5-layer `box-shadow` (3 outer glows + 2 inset highlights) for a glassy, lit-sphere look.
- `.core` — small bright white-to-cyan radial gradient center.
- `.shimmer` — an additional blurred highlight for depth.
- States: **idle** (float `translateY` ±10px over 4s + pulse scale 1↔1.05 over 4s, glow layers pulse in sync), **hover** (scale 1.1, stronger glow, "Coral" name label fades in below via `::after`), **active/open** (orb recolors to a deeper blue gradient, animations stop), **thinking** (adds a rotating conic-style ring border (`thinkingRing`, 1s linear spin) plus a faster subtle pulse). Fades to 40% opacity during scroll (restored on hover or 2s after scroll stops).
- `AgentAvatar.jsx` is an alternate/earlier version of this same orb (near-identical structure, no name-label, no shimmer/middle-glow layers) — appears to be superseded by `GlowingAIAgent` in the actual render tree (`AIChat.jsx` only imports `GlowingAIAgent`); safe to drop `AgentAvatar` in a rebuild unless a simpler orb variant is wanted.

**Panel — `ChatPanel`** (`components/AIChat/ChatPanel.jsx`): a **full-viewport overlay**, not a corner widget — `position: fixed; inset:0; background: rgba(10,37,64,0.3); backdrop-filter: blur(5px); z-index: 999`. Structure:
1. Floating circular close button (top-right, `48px`, glassy cyan-bordered).
2. Centered "Coral speaking" area: `CoralAvatar` (bobbing coral-branch SVG mascot) beside a **single message bubble** — not a scrolling chat log. Only Coral's *current* message is ever shown; there is no visible history of past user/assistant turns (a deliberate design choice per `CORAL-VOICE-COMPLETE.md`).
3. The message renders with a **typewriter effect**: `setInterval` reveals one character every **30ms**, with a blinking `|` cursor (`.cursor`, `blink` 1s step-end) shown while typing.
4. While waiting on a response, an `isLoading && !isTyping` state shows 3 bouncing dots (`.thinkingDots`, `bounce` keyframe, staggered `-0.32s/-0.16s` delays).
5. Bottom-anchored pill input form: rounded `50px` text input (placeholder "Ask Coral anything...") + circular gradient send button (→ arrow icon), both glassy/ocean-styled, focus glow ring.
- Keyboard: `Escape` closes the panel; input auto-focuses on open.
- Default/greeting message (shown before any question is asked): *"Hey! I'm Coral 🪸 Pranati's AI Assistant from these digital depths. Ask me anything about her - projects, skills, quirks, you name it!"*

**`CoralAvatar.jsx`** — an inline SVG coral-branch mascot (not a photo/3D model): 4 curved branch paths + 4 small "polyp" circles, wrapped in an SVG `feGaussianBlur`+`feMerge` glow filter, plus two cartoon eyes (white sclera + black pupil) that **blink** (`scaleY(1)→scaleY(0.1)`, every 4s) and **look around** (`translate` micro-movements, 10s loop). The whole avatar **bobs and slightly rotates** (`bob`, 5s ease-in-out). While `isThinking`, the drop-shadow filter animates between two glow intensities (`thinking-glow`, 1.5s alternate) instead of a static glow.

**`ChatButton.jsx` / `ChatMessage.jsx` / `ThinkingIndicator.jsx`** — an **earlier chat-history UI** (open/close X icon button, individual left/right message bubbles with `role="article"`, a separate reusable thinking-dots component) that matches the styling still present in `AIChat.module.css` (`.chatMessages`, `.message`, `.messageUser`, `.messageAssistant`, `.chatFooter`, `.loadingIndicator`) but is **not wired into the current render tree** (`AIChat.jsx` uses `ChatPanel`, not `ChatButton`+`ChatMessage`+`ThinkingIndicator`). This appears to be a superseded first draft before the "Coral's Voice" full-screen single-message redesign (see `CORAL-FULLSCREEN-CHAT.md` / `CORAL-VOICE-COMPLETE.md`). **A rebuild should treat `ChatPanel` + `CoralAvatar` + `GlowingAIAgent` as the source of truth** and can drop `ChatButton.jsx`, `ChatMessage.jsx`, `ThinkingIndicator.jsx`, `AgentAvatar.jsx` as dead/legacy code, though their CSS documents useful alternate styling if a traditional chat-log UI is preferred instead of the single-message design.

### 7.2 Personality & voice design intent (from `CORAL-*.md` docs)

Coral's system prompt (living in `server/services/geminiService.js`, see §7.3) encodes a specific persona — preserve this exact voice in any replacement:

- **Identity**: "Coral" — Pranati Arun's personal AI assistant, "living in a digital ocean." Always refers to the portfolio owner **by name, "Pranati"** — never "the developer," "she," or generic terms (this was an explicit fix, see `CORAL-AI-PERSONALITY-UPDATE.md`).
- **Ownership answers**: "Whose portfolio is this?" → "This is Pranati Arun's portfolio!"; "Who made this?" → "Pranati built this!"
- **Tone**: friendly, quirky, conversational, like texting a friend. **Hard cap: 1–2 sentences per response.** Casual language/contractions. **Max 1 emoji per response.**
- **Scope guard**: off-topic questions get redirected — "Let's keep it about Pranati's dev work! What would you like to know?"
- **Easter egg**: "What's the secret of the ocean?" / "Tell me a secret" → a fixed playful line (two slightly different canonical versions appear across the docs — pick one for the rebuild): *"Nice Try, but I'd like to keep my job!"* (in the live `geminiService.js` prompt) or *"Pranati coded me at 3am fueled by coffee and movie soundtracks! 🌊"* (in the personality-update doc). Recommend keeping **one** canonical easter-egg line in the rebuild.
- **Persona facts baked into the prompt**: full name, "Software Engineering Student," loves movies/building web apps/learning tech, personality = passionate/detail-oriented/always-learning, quirks = movie buff/perfectionist coder/night-owl developer, plus dynamic `strengths`/`weaknesses` pulled from the About record (with hardcoded fallbacks: "Full-stack development, problem-solving, quick learner" / "Perfectionist and control freak, gets lost in documentation").
- **Font/voice styling**: the chat text uses a large, glowing, centered treatment — `font-family: 'Courier Prime'/'Orbitron'` depending on version (current CSS in `AIChat.module.css` for `.coralText` actually uses `'Courier Prime', 'Courier New', monospace`, left-aligned in a speech-bubble-styled box with a small triangular "tail," while the `CORAL-VOICE-COMPLETE.md` doc describes an earlier centered `'Orbitron'` treatment — **the shipped CSS (Courier Prime, left-aligned bubble) is the current source of truth**, reproduce that).

### 7.3 Current backend architecture (to be replaced)

Request flow: `ChatPanel` calls `askQuestion(question)` (`services/api.js`) → `POST /api/ask` → `chatRoutes.js` (behind `chatLimiter`: **10 requests/minute per IP**, and `validateChatQuestion` middleware) → `chatController.js`:

```js
const portfolioContext = await portfolioService.getPortfolioContext(); // cached 5 min (PORTFOLIO_CACHE_TTL_MS)
const geminiService = new GeminiService();
const answer = await geminiService.generateResponse(question, portfolioContext);
res.json({ success: true, answer: answer.trim() });
```

`portfolioService.js` assembles `{ projects, skills, about, recentLearning, resume }` from 5 parallel Mongoose queries (`Project`, `Skill`, `About`, `LearningUpdate`, `Resume`), formats/trims each for LLM consumption, and **caches the whole context object in memory for 5 minutes** (`cacheTTL = 300000ms`) to avoid re-querying MongoDB on every chat message.

`geminiService.js`:
- Uses `@google/generative-ai`, model **`gemini-2.5-flash`**, reads `GEMINI_API_KEY` from server env (throws at construction if missing — i.e. **the API key never reaches the browser**, it's server-side only).
- 10-second timeout (`CHAT_TIMEOUT_MS`) raced against the Gemini call via `Promise.race`.
- Builds one large prompt string per request: identity rules + personality rules + strict rules + easter egg + the "About Pranati" persona block + `JSON.stringify(portfolioContext, null, 2)` (the *entire* formatted portfolio dumped as context) + the user's question + a "CORAL'S RESPONSE:" cue. See the full prompt text in the file if reproducing verbatim (`server/services/geminiService.js` lines 58–102).
- On timeout/API-key/generic errors, `chatController.js` catches and returns a **friendly in-character fallback answer** rather than an HTTP error (`success:true` is always returned to the client, even on failure) — e.g. *"I'm having trouble generating a response right now. Please try again in a moment!"*

Frontend client (`services/api.js`): plain `axios` instance, `baseURL` from `VITE_API_URL` env var (defaults to `http://localhost:5000/api`), 10s timeout, generic error-message normalization via response/error interceptors. `askQuestion` is a one-line `POST /ask`.

---

## 8. Frontend-Only Chatbot Strategy

The core problem: the current design **must never expose `GEMINI_API_KEY` in browser-shipped code**, and the current architecture also depends on MongoDB for the portfolio context. Below are three viable replacements, ranked by recommendation for a "must be 100% frontend" rebuild.

### Option A (Recommended default): Static/rule-based Coral, zero LLM calls
Convert the portfolio data (`projects`, `skills`, `about`, `resume`) into a static JS/JSON module bundled with the app (see §11). Replace `askQuestion()` with a local matcher:
- Keyword/intent matching against the user's question (simple `includes()`/regex rules, or a small fuzzy-matching library like `fuse.js` for typo tolerance) mapped to canned, personality-authored responses that pull live values from the static data (so "what are Pranati's skills?" interpolates the actual skills array rather than being purely hardcoded).
- Reproduce Coral's exact voice rules (§7.2) as authored copy: short (1–2 sentence) responses, casual tone, ≤1 emoji, the "Pranati by name" rule enforced by construction (you write the strings), the ownership Q&A, and the single easter egg line.
- Unmatched/off-topic input falls back to the scope-guard line: *"Let's keep it about Pranati's dev work! What would you like to know?"*
- **Pros**: no backend, no API key, no cost, no rate limits, instant responses, works offline, zero moving parts to break.
- **Cons**: not truly generative — can't handle novel phrasing gracefully without a reasonably large rule set; requires manually authoring the response bank.
- This is the only option that satisfies "everything on the frontend" **literally** — no network call to any AI provider at all.

### Option B: Serverless function as a thin API-key proxy
Keep real Gemini (or OpenAI/Claude/etc.) calls, but move `GeminiService`'s logic into a single serverless function (Vercel `/api/ask.js` Edge/Node function, Netlify Function, or a Cloudflare Worker) that:
1. Reads the LLM API key from the platform's server-side environment variables (never bundled to the client).
2. Bundles the static portfolio JSON directly into the function (no DB call needed — same static data as Option A).
3. Proxies the prompt-building + LLM call logic almost 1:1 from `geminiService.js`, and applies rate limiting via the platform's edge middleware or a simple in-memory/KV counter.
4. The React app's `askQuestion()` just POSTs to `/api/ask` on the same deployed domain — from the client's perspective this looks identical to today, no `axios` baseURL changes needed beyond removing the explicit port-5000 target.
- **Note on the "100% frontend" constraint**: this is *technically* a server (a function that runs server-side), but it is the industry-standard way to keep an LLM key secret while still deploying as a single static-site-adjacent project (Vercel/Netlify treat it as part of "frontend hosting," not a separately managed Express/Mongo server). If the user's constraint is "no server I have to run/maintain/scale" rather than "literally zero server-side code," this is the best fidelity-to-cost tradeoff — keeps genuinely generative, on-topic answers to arbitrary questions.
- **Cons**: still needs an API key + billing account with the LLM provider; still has a network dependency; slightly more deployment complexity than pure static hosting.

### Option C: Direct browser → LLM API call with a restricted key
Call Gemini/OpenAI directly from client-side JS using a key embedded in the built bundle (`import.meta.env.VITE_GEMINI_API_KEY`).
- **Only viable if** the key is restricted at the provider level (Google AI Studio / Google Cloud API key restrictions: HTTP referrer allow-list locked to the deployed domain, plus a strict per-key quota) — and even then, the key is visible in browser devtools/network tab to any visitor, so it **will eventually be scraped and abused** if the site gets any traffic. Rate-limiting must be enforced provider-side (quota), since there is no server to enforce a per-IP limiter like the current `chatLimiter`.
- **Recommendation: avoid this option** for anything beyond a personal/low-traffic portfolio experiment. It reintroduces the exact risk the "frontend-only" constraint is presumably trying to avoid (managing/rotating a leaking key), without the benefits of Option B (real serverless rate limiting, request logging, ability to swap providers server-side).

### Recommendation
Ship **Option A** as the default (matches "everything on the frontend" literally, no ongoing cost/risk, fastest to build and fully reproduces Coral's actual observed behavior — short canned/interpolated answers — since the current system prompt already constrains Gemini to behave almost like a rule-based bot). Offer **Option B** as an optional upgrade path if genuinely open-ended Q&A is wanted later; document it as "not part of the static build" so the core deliverable stays deployable to GitHub Pages/any static host with zero server dependency.

### 8.1 Decision (locked in for this rebuild)

The chatbot is a **must-have**, and the project deploys as a **single Vercel project** (no separate server host, no MongoDB). This rules out Option A alone (not generative) and Option C (leaks the key). **Go with Option B**, specifically on Vercel:

- **Structure**: standard Vite React app at the repo root, plus an `/api` folder — Vercel auto-detects `api/*.js` files and deploys each as a serverless function alongside the static build, in the *same* `vercel deploy`. No second project, no second URL, no CORS config needed (same origin).
- **`api/ask.js`** (Node serverless function): receives `{ message, history }` from the client, builds the system prompt from the same static portfolio data used by the frontend (import the shared `src/data/portfolio.js` — Vite's build won't bundle it into the client unless the client also imports it, and Vercel's function bundler resolves the import independently for the function build), calls the Gemini API with `GEMINI_API_KEY` read from `process.env` (set in Vercel Project Settings → Environment Variables, never committed), and returns `{ reply }`.
- **Rate limiting**: no Express `chatLimiter` middleware available; use a lightweight per-IP limiter inside the function (e.g. Vercel KV or Upstash Redis free tier for a sliding-window counter), or simpler — rely on the Gemini API's own quota plus a client-side cooldown (disable the send button for N seconds after each message) as a first pass, upgrading to Upstash if abuse becomes a real problem.
- **Client change**: `services/api.js` posts to `/api/ask` (relative path — works identically in `vercel dev` locally and in production, no baseURL/env branching needed).
- **Local dev**: use `vercel dev` (not plain `vite`) so the `/api` functions run locally too; document this in the README since it's a one-command change from a normal Vite-only workflow.
- **Why not MongoDB here**: the function already has the portfolio data at build/deploy time via static import — there's nothing left for a database to do unless chat history/analytics persistence is wanted later, which is out of scope per the "single Vercel deployment, keep it simple" decision.

This supersedes the more cautious "Option A by default" framing above — for *this* rebuild, build Option B directly.

---

## 9. Easter Eggs & Extras (`utils/easterEggs.js`, wired in `App.jsx`)

Generic reusable `KeySequenceDetector` class (tracks a rolling buffer of keypresses, case-insensitive, ignores `<input>`/`<textarea>`/`contenteditable` targets by default, resets after 3s of inactivity, reports cursor `{x,y}` position to its callback):

1. **Welcome toast** — first-visit only (`localStorage.hasVisited`), shows `"Welcome!"` info toast 500ms after mount, 3s auto-dismiss.
2. **Dark mode toggle** — pressing `.` (period) anywhere calls `toggleTheme()`.
3. **"hello" typed anywhere** → tooltip *"Hey there!"* at cursor position, 2s dismiss.
4. **"help" typed anywhere** → tooltip *`Try asking: "What projects have you built?" or "Tell me about your skills"`*, 4s dismiss (longer, more text).

All easter eggs are optional/non-blocking, respect `prefers-reduced-motion`, and use the standard `--transition-fast/base/slow` timing tokens.

---

## 10. Responsiveness & Accessibility to Preserve

### 10.1 Responsive contract (`client/RESPONSIVE_DESIGN.md`)
Mobile-first; breakpoints `640 / 768 / 1024 / 1280px`. Key per-component behavior to reproduce:
- **Nav**: hamburger + slide-in `MobileMenu` below 768px; full inline links above.
- **Projects grid**: 1 / 2 / 3 columns at mobile / tablet / desktop.
- **AI orb**: 48px mobile → 56px tablet → 60–80px desktop (values differ slightly between `AgentAvatar` doc spec and shipped `GlowingAIAgent` CSS — shipped CSS is 60px mobile/70px tablet/80px desktop; treat shipped CSS as authoritative).
- **Chat panel**: full-screen on all breakpoints in the current shipped version (the full-screen redesign superseded the earlier "380px corner box" spec in the responsive doc — shipped behavior wins).
- **Hero**: stacked full-width CTA buttons on mobile; horizontal row on tablet+.
- **Touch targets**: minimum 44×44px enforced via `@media (hover:none) and (pointer:coarse)`.
- **Gradient/Ocean backgrounds**: animation fully disabled on mobile (`<640px`), moderate on tablet, full on desktop.

### 10.2 Accessibility contract (`client/ACCESSIBILITY.md`)
- Full keyboard nav: Tab/Shift+Tab, Enter/Space activation, Escape closes modals/chat/mobile-menu, `.` toggles dark mode globally.
- Enhanced `:focus-visible` styling everywhere: `3px solid` primary-blue outline, `3px` offset, plus a soft glow `box-shadow` — apply this one focus-ring recipe universally rather than relying on browser defaults.
- Semantic HTML + correct heading hierarchy; `<nav>`/`<main>`/`<section>`/`<article>` used deliberately.
- ARIA: `aria-label` on all icon-only buttons, `aria-labelledby` linking sections to their headings, `role="dialog" aria-modal` on modals/chat, `role="status" aria-live="polite"` on loaders, `role="alert"` on errors, `aria-current="page"` on active nav links, `aria-expanded`/`aria-controls` on toggle buttons.
- Skip-to-content link (`.skip-to-content`, visually hidden until focused, jumps to `#main-content`).
- `prefers-reduced-motion: reduce` handled **globally** (`* { animation-duration:0.01ms !important; ... }`) *and* redundantly per-component (many components double-guard with their own reduced-motion media query) — reproduce the belt-and-suspenders approach, it's intentional defensive coverage.
- `prefers-contrast: high` support: swaps to pure black/white text, thicker (4px) outlines, thicker borders on ocean containers.
- WCAG AA color contrast was explicitly audited and fixed at least once (see the `--ocean-text-light` comment in `variables.css`: "#F0FAFF improved from #E0F7FF for better contrast").

### 10.3 Known limitations (documented, carry forward as known tradeoffs)
Ocean Mode disabled/reduced on mobile for performance; some decorative animations are non-essential by design; color gradients may not read for all forms of colorblindness.

---

## 11. Performance Optimization Patterns to Preserve

From `client/PERFORMANCE_OPTIMIZATIONS.md` + the actual util/hook code:

1. **GPU-friendly animation**: animate only `transform`/`opacity`, never layout-triggering properties. `will-change` applied **only during active states** (`:hover`), not persistently, to avoid memory bloat.
2. **Adaptive backdrop-filter blur** (`utils/performanceUtils.js::detectPerformanceLevel`): a weighted score from `navigator.hardwareConcurrency` (CPU cores), `navigator.deviceMemory`, `navigator.connection.effectiveType`, and mobile-UA detection → `'high'|'medium'|'low'`, applied once via `document.documentElement.setAttribute('data-performance', level)` on app mount (`applyPerformanceClass()` in `App.jsx`). CSS then branches blur amount: 15px (high) / 10px (medium) / 5px (low) / none (`@supports not (backdrop-filter)` or `data-no-backdrop-filter`).
3. **Lazy rendering**:
   - `LazySection.jsx` — defers mounting a whole section's subtree until it's within `200px` of viewport (IntersectionObserver, `threshold:0.01`), used for Projects/Skills+About+Contact(Tabbed)/Resume in `App.jsx`. Falls back to immediate render if `IntersectionObserver` is unsupported.
   - `LazyImage.jsx` — same IO pattern per-image (`threshold:0.1, rootMargin:'50px'`), shimmer placeholder while loading, graceful error state, plus native `loading="lazy"` as a second line of defense.
4. **3D-specific**: pixel ratio capped at 2x everywhere (`getPixelRatio(2)`); particle count/caustics/antialias/texture-resolution scaled per device tier (§4.6); manual per-system frame-rate limiting (particles 30fps / caustics 20fps / ocean-floor 15fps) via timestamp checks inside `useFrame`, independent of the render loop's actual FPS.
5. **In-memory data caching** (backend-only today, but the *pattern* is worth keeping conceptually): `portfolioService.js` cached the assembled context for 5 minutes to avoid redundant DB hits — in a static-data rebuild this becomes moot (data is bundled at build time, no runtime fetch needed at all), which is itself a performance win over the current fetch-on-every-mount pattern in `About`/`Skills`/`Contact`/`Resume`/`Projects`.
6. **Battery/data saver**: `@media (prefers-reduced-data: reduce)` strips background images and heavy animations entirely.
7. **`usePerformanceMonitor` hook**: optional real-time FPS sampling (`measureFPS(duration)`, `requestAnimationFrame`-counted) available for future adaptive-quality features; not currently wired to automatically downgrade 3D quality mid-session (the Three.js side's "adaptive quality" comments in `UnderwaterScene.jsx` describe intended behavior that isn't fully implemented — the config is computed once on mount, not re-evaluated live).

---

## 12. Suggested Project Structure for the Frontend-Only Rebuild

```
portfolio/
├── index.html
├── package.json                  # react, react-dom, three, @react-three/fiber,
│                                  # @react-three/drei, prop-types (add explicitly), vite
├── vite.config.js                # no /api proxy needed
├── public/
│   └── resume.pdf
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── data/                     # replaces MongoDB — static content, bundled at build time
    │   ├── projects.js           # array matching Project schema shape (name, description,
    │   │                         # techStack, demoUrl, githubUrl, motivation{problem,challenge,keyLearning})
    │   ├── skills.js              # { Frontend:[...], Backend:[...], Database:[...], Tools:[...], Other:[...] }
    │   ├── about.js               # { bio, interests[], learningMindset, email, github, linkedin, phone,
    │   │                         #   strengths[], weaknesses[] }
    │   ├── resume.js              # { summary, education[], experience[], certifications[] }
    │   └── coralResponses.js     # Option A chatbot: rule/keyword → response bank (see §8)
    ├── context/
    │   ├── ThemeContext.jsx
    │   └── OceanModeContext.jsx
    ├── hooks/
    │   ├── useTheme.js
    │   ├── useOceanMode.js
    │   ├── useScrollSpy.js
    │   ├── useIntersectionObserver.js
    │   ├── useKeyPress.js
    │   ├── useToast.js
    │   └── usePerformanceMonitor.js
    ├── services/
    │   └── coral.js               # replaces api.js's askQuestion() — local matcher (Option A)
    │                               # or fetch('/api/ask') if Option B serverless proxy is used
    ├── styles/
    │   ├── variables.css          # consolidated single source (merge variables.css + ocean-theme.css)
    │   ├── global.css
    │   ├── animations.css
    │   └── oceanAnimations.css
    ├── utils/
    │   ├── deviceDetection.js
    │   ├── webglDiagnostics.js
    │   ├── performanceUtils.js
    │   ├── scrollUtils.js
    │   └── easterEggs.js
    └── components/
        ├── Layout/            (Layout, OceanModeLayout, Section, TransparentSection)
        ├── Navigation/        (Navigation, OceanModeHeader, MobileMenu)
        ├── Hero/
        ├── About/
        ├── Skills/            (Skills, SkillTag)
        ├── Projects/          (Projects, ProjectCard, ProjectModal)
        ├── Resume/
        ├── Contact/
        ├── TabbedContent/
        ├── AIChat/            (AIChat, ChatPanel, CoralAvatar, GlowingAIAgent)
        │                      # drop legacy ChatButton/ChatMessage/ThinkingIndicator/AgentAvatar
        │                      # unless reviving the chat-log UI variant
        ├── Background/
        │   ├── GradientBackground.jsx
        │   ├── OceanBackground.jsx
        │   ├── CanvasOceanBackground.jsx
        │   ├── InteractiveOcean.jsx
        │   ├── ThreeOceanBackground.jsx
        │   └── three/
        │       ├── config.js
        │       ├── UnderwaterScene.jsx
        │       ├── Lighting.jsx
        │       ├── OceanFloor.jsx
        │       ├── ParticleSystem.jsx
        │       ├── CausticsEffect.jsx
        │       ├── InteractiveCamera.jsx
        │       ├── SwimmingFish.jsx
        │       ├── FloatingJellyfish.jsx
        │       ├── CoralReef.jsx
        │       └── SwimmingTurtle.jsx
        └── common/
            ├── Button.jsx
            ├── Modal.jsx
            ├── Toast.jsx
            ├── Tooltip.jsx
            ├── Divider.jsx
            ├── FadeInSection.jsx
            ├── LazyImage.jsx
            ├── LazySection.jsx
            ├── OceanLoader.jsx
            ├── NewOceanLoader.jsx
            ├── OceanToggleButton.jsx
            ├── CoralDirectionalAnimation/
            └── ErrorBoundary.jsx
```

**Data-fetching change required throughout**: every component that currently does
```js
useEffect(() => { fetchX().then(res => setData(res.data)) }, []);
```
becomes a direct static import:
```js
import { projects } from '../../data/projects';
```
This eliminates `loading`/`error` state entirely for content data (only the intentional artificial Projects-loader delay, §5.5, would need a deliberate decision to keep or drop) and removes `axios` as a dependency except for the optional Option B serverless chatbot proxy call.

Deploy target: any static host (Vercel/Netlify/Cloudflare Pages/GitHub Pages) with `vite build` → `dist/`. If Option B is chosen for the chatbot, Vercel or Netlify are preferred since they support colocated serverless functions in the same repo/deploy without a separate server to manage.
