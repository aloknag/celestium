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

## Verification workflow (required)
When making code changes, follow this order unless the user explicitly asks otherwise:
1. Implement the change (minimal, spec-driven).
2. Run lint: `npm run lint`
3. Run typecheck + build: `npm run build`
4. Run Playwright MCP smoke tests (see checklist below) against the dev server.

If the dev server is needed:
- Start it from `celestium-spa/` with `npm run dev`.
- If the default port is busy, Vite will pick another (e.g. `5174`). Use the printed URL.

### Playwright MCP smoke-test checklist
Use the Playwright MCP browser tools (snapshot/click/type/wait) to verify UX after changes.
Keep tests simple and spec-aligned (no extra flows).

Run these checks (adapt only if the change doesn’t touch that area):
1. **App loads**: Dashboard renders without console errors; main HUD visible.
2. **God String legibility**: AEON/EPOCH/ARC/PHASE/ROTATION read clearly; punctuation visible.
3. **Mode toggle**: Toggling ISO ⇄ TRUE_SOLAR updates protocol badge and does not crash.
4. **ISO uninitialized state**: In ISO/Standard, LAT/LON labels are readable; values show placeholder and look intentionally uninitialized.
5. **Geolocation flow (if available)**: Trigger location request; status text changes appropriately.
6. **Visualizer visibility**: Ring + constellations remain visible when not focused; focused-sector interactions don’t “black out” the scene.
7. **Responsive layout**: Desktop (e.g. 1280×800) does not overflow vertically; visualizer constrained; header/panels fit.
8. **Typography**: Labels use sans font where intended; numbers remain mono; no missing-font flash that breaks layout.

## Planning requirement
If you create a plan (TODOs), include a short section listing the Playwright MCP smoke tests you will run for that specific change (subset of the checklist above).

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
