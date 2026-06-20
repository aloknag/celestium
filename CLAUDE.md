# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Celestium is

Celestium is a "Planetary Operating System" — a clock/calendar replacement that
expresses time as **astronomical coordinates** instead of Gregorian labels. Rather
than "what time is it?" it answers "where are we?" (Earth's orbital + rotational
position). The conceptual spec lives in `philosophy.md`, `calendar.md`, and
`README.md`; read these before touching domain logic, because the UI is a direct
rendering of that spec.

### The "God String" — the core coordinate vector

Everything the app computes rolls up into one string assembled in
`useCelestium.ts`:

```
Σ :: Ω . α . λ | ρ        e.g.  175k :: 358° . 283 . 15 | 166.250°
```

| Symbol | Name | Source | Meaning |
| :-- | :-- | :-- | :-- |
| Σ Aeon | `AEON` | constant in `lib/astronomy.ts` (`"175k"`) | Precession cycles since Moon formation. Static. |
| Ω Epoch | `EPOCH` | constant in `lib/astronomy.ts` (`"358°"`) | Axial precession angle. Static. |
| α Solar Arc | `useSolar()` | days since last equinox → 0–360° | Replaces month/day. |
| λ Lunar Phase | `useLunar()` | SunCalc illumination → integer `00`–`29` | Moon phase index. |
| ρ Rotation | `useRotation()` | fraction of day → 0–360° | Replaces clock time. |

Aeon and Epoch are hard-coded constants by design (deep-time values that don't
change at human timescales). Only α, λ, ρ are computed live.

## Architecture & data flow

- `App.tsx` is a thin React Router shell: `/` → `Dashboard`, `/help` → `Help`,
  `*` → redirect home.
- **`useCelestium()` (`src/hooks/useCelestium.ts`) is the orchestrator.** It
  composes the per-quantity hooks, wires geolocation into rotation, owns the
  ISO⇄TRUE_SOLAR mode toggle, and builds `godString` / `fullString`. Start here
  when tracing any displayed value.
- Per-quantity hooks each own their own `setInterval`/`requestAnimationFrame`
  loop and astronomy math:
  - `useSolar()` — Luxon + `EQUINOX_TABLE` (`lib/astronomy.ts`); 1s tick.
  - `useRotation()` — STANDARD = wall-clock fraction of day; TRUE_SOLAR = SunCalc
    `solarNoon` for the user's lat/lon mapped so 180° = local zenith; rAF loop.
  - `useLunar()` — SunCalc moon illumination → 0–29 index; 60s tick.
  - `useConstellation(arc)` — pure function mapping arc° to IAU constellation
    boundaries (13 sectors, **includes Ophiuchus**; not zodiac signs).
  - `useCosmicEvent(lat, lon)` — uses `astronomy-engine` (separate from SunCalc)
    to find the next notable event (eclipse/solstice/equinox/super-/micromoon).
- **State is intentionally minimal.** The Zustand store (`src/store/store.ts`)
  holds only `mode` (`STANDARD | TRUE_SOLAR`) and `focusedSector` (which part of
  the God String the user has highlighted). Everything else is derived in hooks.
- Presentation: `pages/Dashboard.tsx` composes the HUD; `components/HUD/`
  (`Visualizer.tsx` = SVG ring + star map, `SidePanel.tsx`, `RightPanel.tsx`);
  `components/common/SlotCounter.tsx` = animated digit roller.

## Critical domain rules (don't "fix" these — they are the spec)

- **Null Interval.** `useSolar()` treats `daysElapsed > 360` as `isNull = true`,
  sets `arc = null`, and emits a countdown to the next equinox. The orbit is
  ~365.24 days but the year is a perfect 360° cycle; the ~5 remainder days are
  deliberately "Null" time (UI turns red, arc reads `NULL`). This is the
  intended calibration period, not a bug.
- **TRUE_SOLAR safety eject.** If the user denies geolocation, `useCelestium()`
  reverts `mode` to `STANDARD` automatically.
- **Static constants.** Don't compute `AEON`/`EPOCH`; they are intentional
  literals in `lib/astronomy.ts`.
- **`EQUINOX_TABLE` is hand-maintained** and currently only covers 2024–2028.
  Solar arc math breaks outside that range — extend the table when needed.
- **Two astronomy libraries coexist by purpose:** `suncalc` for fast
  sun/moon position (rotation, lunar phase) and `astronomy-engine` for precise
  event search (`useCosmicEvent`). Match the existing usage rather than
  consolidating.

## Commands

All commands run from `celestium-spa/` (the actual app; repo root holds only the
spec markdown).

```bash
npm ci          # install (package-lock.json is committed)
npm run dev      # Vite dev server (may pick 5174+ if 5173 busy — use printed URL)
npm run build    # tsc -b (typecheck) THEN vite build
npm run lint      # eslint . over **/*.{ts,tsx}
npm run preview   # serve the production build
```

There is **no unit-test runner**. Verification is done with Playwright MCP smoke
tests against a running dev server (see checklist below).

## Working conventions (from .github/copilot-instructions.md)

- **Do NOT auto-start the dev server** unless verification requires it. The repo
  convention is to let the user start `npm run dev` and provide the URL.
- For a feature/fix: branch, implement minimally + spec-driven, then run in
  order: `npm run lint` → `npm run build` → Playwright MCP smoke tests.
- TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters` — keep types
  tight and don't leave unused exports (the build will fail).
- Styling is Tailwind-first using the Celestium palette tokens from
  `tailwind.config.cjs`: `bg-celestium-bg`, `text-celestium-text`,
  `text-celestium-dim`, `text-celestium-accent`, `text-celestium-null`. Reuse the
  `.glow-text` utility in `src/index.css`.
- Animation is Framer Motion only — match existing patterns in
  `components/common/SlotCounter.tsx` and `components/HUD/*`; don't add other
  animation libs.
- The Visualizer is SVG; keep geometry math inside the component and pass
  primitive props (`solarArc`, `rotation`, `lunarPhase`, `isNull`).
- PWA is configured via `vite-plugin-pwa` in `vite.config.ts` (manifest +
  autoUpdate); change icons/manifest there.

### Playwright MCP smoke-test checklist

After UI changes, verify the relevant subset:
1. Dashboard renders, no console errors, HUD visible.
2. God String legible (AEON/EPOCH/ARC/PHASE/ROTATION + punctuation).
3. ISO ⇄ TRUE_SOLAR toggle updates the protocol badge without crashing.
4. ISO uninitialized state: LAT/LON labels readable, values show placeholder.
5. Geolocation flow: status text changes when location requested.
6. Visualizer ring + constellations stay visible when not focused.
7. Responsive: desktop (e.g. 1280×800) doesn't overflow vertically.
8. Typography: sans labels, mono numbers, no font-flash layout break.

## Tech stack

React 19 + TypeScript + Vite 7, Tailwind 3, Zustand 5, React Router 7,
Framer Motion, Luxon (time math), SunCalc + astronomy-engine (astronomy). PWA via
vite-plugin-pwa. Deployed on Vercel (`vercel.json`).
