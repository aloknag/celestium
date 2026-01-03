# Copilot instructions (Celestium SPA)

## Where the app lives
- Main project is in `celestium-spa/` (Vite + React + TypeScript + Tailwind).
- Most work happens under `celestium-spa/src/`.

## Daily workflow (from `celestium-spa/`)
- Install (npm is expected; `package-lock.json` exists): `npm ci`
- Dev server: `npm run dev`
- Typecheck + build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Big picture architecture (data flow)
- `App.tsx` renders the HUD/visualizer and composes the core hooks.
- `useCelestium()` (see `src/hooks/useCelestium.ts`) is the orchestrator:
  - Solar arc + season via `useSolar()` (Luxon + `EQUINOX_TABLE` in `src/lib/astronomy.ts`).
  - Lunar phase via `useLunar()` (SunCalc moon illumination → 0–29 index).
  - Rotation via `useRotation()`:
    - `STANDARD`: wall-clock fraction of day → degrees.
    - `TRUE_SOLAR`: uses SunCalc solarNoon for the user’s location.
  - Geolocation is managed by `useGeolocation()` and fed into `useRotation()`.
- Global state is intentionally minimal: Zustand store in `src/store/store.ts` only stores `mode` (`STANDARD` | `TRUE_SOLAR`).

## Project-specific domain rules
- “Null Interval”: `useSolar()` treats `daysElapsed >= 360` as `isNull=true` and sets `arc=null` with a countdown to the next equinox.
- “TRUE_SOLAR” safety behavior: if geolocation permission is denied, `useCelestium()` reverts mode back to `STANDARD`.

## UI patterns and styling conventions
- Styling is Tailwind-first; use the existing Celestium palette tokens from `tailwind.config.cjs`:
  - `bg-celestium-bg`, `text-celestium-text`, `text-celestium-dim`, `text-celestium-accent`, `text-celestium-null`.
- Reuse the existing glow utility where relevant: `.glow-text` is defined in `src/index.css`.
- Motion/animation is done with Framer Motion (e.g. `src/components/common/SlotCounter.tsx`, `src/components/HUD/*`). Prefer matching those patterns instead of introducing new animation libraries.
- The main visualization is SVG-based in `src/components/HUD/Visualizer.tsx`; keep math/geometry close to the component and pass primitive props (`solarArc`, `rotation`, `lunarPhase`, `isNull`).

## TypeScript/lint expectations
- TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters`; keep types tight and avoid adding unused exports.
- ESLint is configured via `eslint.config.js` and runs on `**/*.{ts,tsx}`.

## PWA integration
- Vite PWA plugin is enabled in `vite.config.ts` (manifest + autoUpdate). If you change icons/manifest fields, update it there.
