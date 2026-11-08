# Living Sky Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `prototypes/clock-night-sky.html` Living Sky as the app's landing at `/`; the existing HUD moves to `/cosmos`, unchanged.

**Architecture:** Pure sky model on astronomy-engine (`lib/sky.ts`) → one rAF loop in `SkyScene` that advances a model clock, draws a Canvas 2D scene, and hands an ~8 Hz snapshot to a DOM overlay. The HUD hooks (`useCelestium`, `useSolar`, `useRotation`, `useLunar`) and `Visualizer` are not touched.

**Tech Stack:** React 19, TS strict, Vite 7, Tailwind 3, Framer Motion (`useReducedMotion` only), astronomy-engine (already a dep), Canvas 2D, Vitest 5 (new, dev-only).

**Spec:** `docs/prd/living-sky.md` · reference `prototypes/clock-night-sky.html` · related `docs/plans/clock-first-onramp.md` (PR #8, unmerged)

**Baseline (planning time, branch `claude/visual-prototype`):** `npm run lint` and `npm run build` green; main chunk 507.08 kB / 169.76 kB gzip; CSS 21.32 kB; PWA precache 518.10 KiB.

## Global Constraints

- Animation: "Framer Motion only … no new animation/3D libraries"; no WebGL (PRD §10, N4). A plain `requestAnimationFrame` canvas loop is not a library (same as `useRotation`).
- "IAU constellations (13, incl. Ophiuchus), never the 12 zodiac signs" (N2); reuse `CONSTELLATIONS` from `src/hooks/useConstellation.ts` (§9).
- N3: HUD stays, reachable from the landing. Null Interval, TRUE_SOLAR eject, `AEON`/`EPOCH`, `EQUINOX_TABLE` are spec (CLAUDE.md): don't modify.
- Hybrid accuracy (§9): real Moon phase and real Sun position; orbital speeds/scale stylized.
- Rates, model-seconds per real second: DAY `86400/22`, MONTH `29.530588853*86400/26`, YEAR `365.25*86400/34` (prototype values; PRD FR5 says ~20/~25/~30 s). NOW = real time, and is the default mode.
- FR7: `prefers-reduced-motion` freezes twinkle/orbits; overlay text stays legible. FR8: mobile portrait + desktop, no layout breakage.
- Perf (§10): generate the starfield once; cap animated nodes; smooth on mobile.
- Palette (prototype): bg `#05070f`, text `#dfe6f5`, dim `#97a0bd`, sun `#ffce8a`, moon `#e8ecf5`; serif + system-mono stacks, no new web fonts.
- TS `strict`, `noUnusedLocals/Parameters`, `erasableSyntaxOnly` (no enums), `verbatimModuleSyntax` (`import type`). ESLint `react-hooks` v7: no `Date.now()`/`Math.random()`/ref reads in render, no synchronous `setState` in effects; non-component exports stay out of `.tsx` (react-refresh).
- Gates, in order, from `celestium-spa/`: `npm run lint` → `npm run test` → `npm run build` → Playwright smoke. Never auto-start the dev server: ask the user to run `npm run dev` and give the URL.
- Commits: conventional prefix like the history (`feat:`, `fix:`, `docs:`), ending with the session's `Co-Authored-By` trailer.

## Review Focus

1. Backgrounded tab / long frame in DAY·MONTH·YEAR must not jump model time (clamp to 50 ms; NOW re-syncs to `Date.now()`). → Task 2.
2. Device date outside `EQUINOX_TABLE` (≥ 2028-03-20, or YEAR mode running for minutes) must still render a correct sky; the landing never reads the table and never touches geolocation. → Tasks 1, 3.
3. Resize / mobile URL-bar collapse must not re-roll the stars or blur the canvas. → Tasks 2, 3.
4. Moon-phase and Pisces wraparound (elongation 359.9→0.1, longitude 350.99→351, ≥360, negative). → Task 1.
5. 320×568 phone: overlay blocks never overlap and buttons stay ≥ 44 px. → Task 4.

## Decisions

**CONFIRM** = needs the owner's yes; everything else is a default taken so the plan is executable.

- **D1 · CONFIRM · Routes.** `/` Landing · `/cosmos` HUD (name reused from PR #8) · `/help` · `*`→`/`. The sky's Rosetta readout (clock time ⇄ ρ) covers what PR #8's Clock page was for, so PR #8 becomes superseded (PRD Q3). Alternative: sky as backdrop behind a clock page.
- **D2 · Data source.** The landing does not use `useCelestium()` (deviates from PRD §10): it is wall-clock-only (cannot time-warp), `useRotation` calls `setState` every frame (60 Hz re-render), and it can trigger a geolocation prompt. Landing uses new pure `lib/sky.ts` (`SunPosition().elon`, `MoonPhase()`). ρ is STANDARD wall-clock; the Sun crosses the meridian at 12:00 civil time (intentional simplification; TRUE_SOLAR stays HUD-only). `dayFraction` uses wall-clock h:m:s so ρ matches the displayed time on DST days (HUD's elapsed-seconds ρ differs by 15° after a shift — noted, not fixed).
- **D3 · Prototype defects fixed in the port** (each has a test or a Playwright check):
  - (a) "You" dot co-rotates with the Sun, so it never crosses night→day (FR1 unmet). → Earth-fixed frame: "you" fixed at the top; the wheel carries stars/Sun/Moon; Sun reaches the top at ρ = 180°.
  - (b) "Overhead" ignores the season (`360 − diurnal`: "Pisces" at every midnight). → `meridianLongitude = sunLon + 180 + 360·dayFrac` (early-Nov midnight → Aries).
  - (c) MONTH/YEAR spin the daily wheel at 1.1 / 10.7 rev/s (YEAR ≈ 64°/frame, aliased). → In MONTH/YEAR the wheel orientation and the displayed clock/ρ are pinned at their entry values (the date advances); "you" and the "overhead" clause are hidden; leaving eases the wheel back (~0.6 s).
  - (d) Handedness: wheel and zodiac both run clockwise, so the Sun's annual drift runs *with* the daily spin. → Look-south view: day clockwise, longitudes increase counter-clockwise (east on the left). YEAR/MONTH therefore run counter-clockwise, unlike the HUD ring. Veto-able.
  - (e) Starfield re-randomizes on every resize. → seeded, prefix-stable.
  - (f) Mean-longitude Sun / mean synodic month (≈ ±3° Sun, ±14 h phase). → astronomy-engine.
  - (g) PRD G3 says "clock/date" but the prototype shows no date. → short date in the readout.
  - (h) Two-circle carve draws ≈ 61 % lit at first quarter (should be 50 %). → half-disc + terminator half-ellipse, x-semi-axis `terminatorX`.
- **D4 · Rendering.** Canvas 2D sky layer (≈ 420 dots/frame at 1280×800); DOM + Tailwind overlay; plain rAF. Contingency if < 50 fps on a mid-range phone: move the starfield to an offscreen layer rotated by CSS transform.
- **D5 · CONFIRM · HUD parity.** `useConstellation(solar.arc)` treats α (days since equinox, 1°/day) as ecliptic longitude, so the HUD runs up to ~7 days ahead of the real Sun late in the year (HUD says Scorpius from Nov 16; the Sun really enters it Nov 23). The landing shows the real sky, so they will disagree for ~a week at each boundary from ~Oct 24. Default: leave the HUD alone and record the gap. Option: Task 5 Step 2 switches the HUD to true longitude.
- **D6 · Reduced motion.** DAY/MONTH/YEAR stay enabled (user-initiated; the prototype disables them, removing the product's "aha" for these users); twinkle freezes; nothing auto-animates.
- **D7 · Null Interval.** Landing shows no α and reads neither `EQUINOX_TABLE` nor `useSolar` (PRD silent; avoids inheriting the table's 2028-03-20 cliff — after that date the HUD reads NULL forever; pre-existing, not in this plan).
- **D8 · Tests.** Add Vitest for `lib/` only (repo has no runner; vitest 5.1.0 supports Vite ^7). Declining turns the Task 1–2 tests into Playwright `browser_evaluate` checks.
- **D9 · Git.** Commit the prototype's uncommitted edits first (NOW default = PRD Q4, honest mode labels, 44 px targets, narrow layout, reduced-motion). Work on `feat/living-sky` cut from `claude/visual-prototype`; PR to `main` after #9 merges (or stacked). No `viewport-fit=cover` change: the HUD has no safe-area padding.

## File Structure

| File (under `celestium-spa/`) | Responsibility |
| :-- | :-- |
| `src/lib/sky.ts` (+ `.test.ts`) | Pure sky math: Sun/Moon state, constellation lookup, frame angles |
| `src/lib/skyClock.ts` (+ `.test.ts`) | Modes, rates, labels, `stepModelTime` |
| `src/lib/starfield.ts` (+ `.test.ts`) | Seeded, prefix-stable stars + haze |
| `src/components/Sky/drawSky.ts` | Imperative canvas renderer (no React, no timers) |
| `src/components/Sky/SkyScene.tsx` | Canvas element, sizing, rAF loop, snapshot throttle |
| `src/components/Sky/SkyOverlay.tsx` | Readout, sentence, mode controls, links (DOM) |
| `src/pages/Landing.tsx` | Composes scene + overlay; sets `data-theme="sky"` |
| `src/App.tsx`, `Help.tsx`, `Dashboard.tsx` | Routes and reciprocal links |
| `tailwind.config.cjs`, `src/index.css` | `night-*` tokens, sky fonts, HUD-only overlays scoped out |

---

### Task 1: Vitest + sky model

**Files:**
- Modify: `celestium-spa/package.json`, `celestium-spa/package-lock.json`
- Create: `celestium-spa/src/lib/sky.ts`
- Test: `celestium-spa/src/lib/sky.test.ts`

**Interfaces:**
- Consumes: `import * as Astronomy from 'astronomy-engine'` (style of `useCosmicEvent.ts`): `SunPosition(date).elon`, `MoonPhase(date)`; `CONSTELLATIONS`.
- Produces (degrees, `[0,360)`, 0 = top, clockwise on screen):
  ```ts
  export type PhaseWord = 'new' | 'waxing crescent' | 'first-quarter' | 'waxing gibbous'
    | 'full' | 'waning gibbous' | 'last-quarter' | 'waning crescent';
  export interface SkyState { sunLon: number; moonLon: number; elong: number; illum: number; waxing: boolean; phaseWord: PhaseWord }
  export interface SkySnapshot { date: Date; dayFrac: number; sky: SkyState; meridianLon: number; frozen: boolean }
  export function skyAt(date: Date): SkyState;
  export function phaseWordAt(elong: number): PhaseWord;
  export function constellationAtLongitude(lon: number): string;       // CONSTELLATIONS name, e.g. 'OPHIUCHUS'
  export function dayFraction(date: Date): number;                      // local h:m:s.ms / 86400
  export function meridianLongitude(sunLon: number, dayFrac: number): number;
  export function screenAngle(lon: number, meridianLon: number): number;
  export function terminatorX(elong: number, r: number): number;
  ```

- [ ] **Step 1: Pin the reference and branch.** `git add prototypes/clock-night-sky.html && git commit -m "feat(prototype): NOW default, honest mode labels, 44px targets, narrow layout"` then `git switch -c feat/living-sky`. Expected: clean tree on the new branch.
- [ ] **Step 2: Baseline.** `npm ci && npm run lint && npm run build`. Expected: both exit 0; main chunk ≈ 507 kB (record the number if it differs).
- [ ] **Step 3: Add the runner.** `npm i -D vitest`, add script `"test": "vitest run"`. Run `npm run test`. Expected: "No test files found".
- [ ] **Step 4: Write the failing tests** in `src/lib/sky.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import * as Astronomy from 'astronomy-engine';
  import { EQUINOX_TABLE } from './astronomy';
  import { skyAt, phaseWordAt, constellationAtLongitude, dayFraction,
           meridianLongitude, screenAngle, terminatorX } from './sky';

  const circ = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
  const phaseAt = (deg: number) =>
    Astronomy.SearchMoonPhase(deg, new Date('2026-11-01T00:00:00Z'), 40)!.date;

  describe('skyAt', () => {
    it('Sun is at 0° at the 2026 equinox in EQUINOX_TABLE', () => {
      const t = EQUINOX_TABLE.find(e => e.year === 2026)!.timestamp;
      expect(circ(skyAt(new Date(t)).sunLon, 0)).toBeLessThan(0.05);
    });
    it('Sun is at 90° at the 2026 June solstice', () => {
      expect(circ(skyAt(Astronomy.Seasons(2026).jun_solstice.date).sunLon, 90)).toBeLessThan(0.05);
    });
    it.each([[0, 'new'], [90, 'first-quarter'], [180, 'full'], [270, 'last-quarter']] as const)(
      'at library phase %i° elong matches and word is %s', (deg, word) => {
        const s = skyAt(phaseAt(deg));
        expect(circ(s.elong, deg)).toBeLessThan(0.05);
        expect(s.phaseWord).toBe(word);
      });
    it('illum ≈ 0 at new and ≈ 1 at full; waxing flips at full', () => {
      expect(skyAt(phaseAt(0)).illum).toBeLessThan(0.001);
      const full = phaseAt(180);
      expect(skyAt(full).illum).toBeGreaterThan(0.999);
      expect(skyAt(new Date(full.getTime() - 864e5)).waxing).toBe(true);
      expect(skyAt(new Date(full.getTime() + 864e5)).waxing).toBe(false);
    });
    it('moonLon = sunLon + elong (mod 360)', () => {
      const s = skyAt(new Date('2026-11-08T12:00:00Z'));
      expect(circ(s.moonLon, s.sunLon + s.elong)).toBeLessThan(1e-9);
    });
    it.each(['1999-12-31T00:00:00Z', '2031-06-01T00:00:00Z', '2100-01-01T00:00:00Z'])(
      'is finite outside the equinox table: %s', iso => {
        const s = skyAt(new Date(iso));
        for (const v of [s.sunLon, s.moonLon, s.elong, s.illum]) expect(Number.isFinite(v)).toBe(true);
        expect(s.sunLon).toBeGreaterThanOrEqual(0);
        expect(s.sunLon).toBeLessThan(360);
      });
  });

  describe('phaseWordAt', () => {
    it.each([[0, 'new'], [45, 'waxing crescent'], [90, 'first-quarter'], [135, 'waxing gibbous'],
             [180, 'full'], [225, 'waning gibbous'], [270, 'last-quarter'], [315, 'waning crescent'],
             [359, 'new']] as const)('%i° → %s', (e, w) => expect(phaseWordAt(e)).toBe(w));
  });

  describe('constellationAtLongitude', () => {
    it.each([[28.99, 'PISCES'], [29, 'ARIES'], [247.99, 'SCORPIUS'], [248, 'OPHIUCHUS'],
             [350.99, 'AQUARIUS'], [351, 'PISCES'], [0, 'PISCES'], [360, 'PISCES'],
             [-1, 'PISCES'], [389, 'ARIES']] as const)('%f° → %s', (l, c) =>
      expect(constellationAtLongitude(l)).toBe(c));
  });

  describe('frame', () => {
    it('dayFraction is local wall-clock', () => {
      expect(dayFraction(new Date(2026, 10, 8, 12, 0, 0))).toBeCloseTo(0.5, 9);
      expect(dayFraction(new Date(2026, 10, 8, 6, 30, 0))).toBeCloseTo(6.5 / 24, 9);
    });
    it('Sun is at the top at noon, bottom at midnight, left (east) at 06:00', () => {
      const S = 225;
      expect(screenAngle(S, meridianLongitude(S, 0.5))).toBeCloseTo(0, 9);
      expect(screenAngle(S, meridianLongitude(S, 0))).toBeCloseTo(180, 9);
      expect(screenAngle(S, meridianLongitude(S, 0.25))).toBeCloseTo(270, 9);
    });
    it('overhead follows the season (prototype said PISCES at every midnight)', () => {
      expect(constellationAtLongitude(meridianLongitude(226, 0))).toBe('ARIES');
    });
    it('terminator is straight at quarter, hugs the limb at new, wraps at full', () => {
      expect(terminatorX(0, 10)).toBeCloseTo(10, 9);
      expect(terminatorX(90, 10)).toBeCloseTo(0, 9);
      expect(terminatorX(180, 10)).toBeCloseTo(-10, 9);
    });
  });
  ```
- [ ] **Step 5: Run to verify failure.** `npm run test`. Expected: FAIL, cannot resolve `./sky`.
- [ ] **Step 6: Implement `src/lib/sky.ts`.** All angles normalized to `[0,360)`. `elong = MoonPhase(date)`; `sunLon = SunPosition(date).elon`; `moonLon = (sunLon + elong) % 360`; `illum = (1 − cos(elong·π/180)) / 2`; `waxing = elong < 180`. `phaseWordAt` bands on `frac = elong/360`, copied from the prototype: `<0.03 | >0.97` new; `<0.22` waxing crescent; `<0.28` first-quarter; `<0.47` waxing gibbous; `<0.53` full; `<0.72` waning gibbous; `<0.78` last-quarter; else waning crescent. `constellationAtLongitude` normalizes to `[0,360)` then mirrors `useConstellation`'s reverse-`find`, with `< 29` → `'PISCES'`. `meridianLongitude = (sunLon + 180 + 360·dayFrac) mod 360`; `screenAngle = (meridianLon − lon) mod 360` (non-negative); `terminatorX = r·cos(elong·π/180)` (x toward the Sun). `dayFraction` uses `getHours()/getMinutes()/getSeconds()/getMilliseconds()`.
- [ ] **Step 7: Run to verify pass.** `npm run test && npm run lint && npm run build`. Expected: all green.
- [ ] **Step 8: Commit.** `git add celestium-spa/package.json celestium-spa/package-lock.json celestium-spa/src/lib && git commit -m "feat(sky): pure sky model on astronomy-engine, add vitest"`

---

### Task 2: Model clock + starfield

**Files:**
- Create: `celestium-spa/src/lib/skyClock.ts`, `celestium-spa/src/lib/starfield.ts`
- Test: `celestium-spa/src/lib/skyClock.test.ts`, `celestium-spa/src/lib/starfield.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  // skyClock.ts
  export type SkyMode = 'now' | 'day' | 'month' | 'year' | 'pause';
  export const MAX_DT_MS = 50;
  export const MODE_SPEED: Record<SkyMode, number>;      // now 1, pause 0, day/month/year per Global Constraints
  export const MODE_LABEL: Record<SkyMode, string>;      // verbatim prototype MODE_LABEL (L302–308)
  export const FROZEN_MODES: ReadonlySet<SkyMode>;       // 'month', 'year'
  export function stepModelTime(prevMs: number, dtMs: number, mode: SkyMode, nowMs: number): number;
  // starfield.ts
  export interface Star { lon: number; rad: number; r: number; base: number; amp: number; sp: number; ph: number; warm: boolean }
  export interface Haze { lon: number; rad: number; off: number; r: number; base: number; sp: number; ph: number }
  export interface Starfield { stars: Star[]; haze: Haze[] }
  export function starCount(w: number, h: number): number;
  export function buildStarfield(seed: number, count: number): Starfield;
  ```

- [ ] **Step 1: Write the failing tests.**
  ```ts
  // skyClock.test.ts
  import { describe, it, expect } from 'vitest';
  import { stepModelTime, MAX_DT_MS } from './skyClock';

  describe('stepModelTime', () => {
    it('now → wall clock, ignoring prev and dt', () => expect(stepModelTime(1, 16, 'now', 123)).toBe(123));
    it('pause → unchanged', () => expect(stepModelTime(7, 16, 'pause', 123)).toBe(7));
    it('ignores negative dt', () => expect(stepModelTime(10, -5, 'day', 0)).toBe(10));
    it('clamps long frames to MAX_DT_MS (backgrounded tab)', () =>
      expect(stepModelTime(0, 5000, 'year', 0)).toBe(stepModelTime(0, MAX_DT_MS, 'year', 0)));
    it.each([['day', 22, 86400], ['month', 26, 29.530588853 * 86400], ['year', 34, 365.25 * 86400]] as const)(
      '%s: %i s of real time = one cycle', (mode, secs, cycleSec) => {
        let t = 0;
        for (let i = 0; i < (secs * 1000) / MAX_DT_MS; i++) t = stepModelTime(t, MAX_DT_MS, mode, 0);
        expect(t / 1000).toBeCloseTo(cycleSec, 0);
      });
  });
  ```
  ```ts
  // starfield.test.ts
  import { describe, it, expect } from 'vitest';
  import { buildStarfield, starCount } from './starfield';

  describe('starfield', () => {
    it('starCount = round(w*h/4200)', () => expect(starCount(1280, 800)).toBe(244));
    it('is deterministic per seed and differs across seeds', () => {
      expect(buildStarfield(7, 100)).toEqual(buildStarfield(7, 100));
      expect(buildStarfield(7, 100).stars).not.toEqual(buildStarfield(8, 100).stars);
    });
    it('is prefix-stable, so a resize never re-rolls stars', () => {
      const big = buildStarfield(7, 100), small = buildStarfield(7, 50);
      expect(big.stars.slice(0, 50)).toEqual(small.stars);
      expect(big.haze.slice(0, small.haze.length)).toEqual(small.haze);
      expect(big.haze).toHaveLength(70);
    });
    it('keeps values in range', () => {
      const { stars, haze } = buildStarfield(3, 300);
      for (const s of stars) { expect(s.rad).toBeGreaterThanOrEqual(0); expect(s.rad).toBeLessThanOrEqual(1);
                               expect(s.lon).toBeGreaterThanOrEqual(0); expect(s.lon).toBeLessThan(360); }
      for (const h of haze) { expect(h.rad).toBeGreaterThanOrEqual(0.5); expect(h.rad).toBeLessThanOrEqual(1); }
    });
  });
  ```
- [ ] **Step 2: Run to verify failure.** `npm run test`. Expected: FAIL, modules not found.
- [ ] **Step 3: Implement `skyClock.ts`.** `stepModelTime`: `'now'` → `nowMs`; otherwise `prevMs + min(max(dtMs, 0), MAX_DT_MS) · MODE_SPEED[mode]`. Copy `MODE_LABEL` strings from the prototype exactly.
- [ ] **Step 4: Implement `starfield.ts`.** mulberry32; stars and haze use independent streams (haze seed `seed ^ 0x9e3779b9`); a fixed number of draws per element (so prefixes are stable); haze count `Math.round(count·0.7)`. Ranges from the prototype: star `r` 0.4–1.7, `base` 0.2–0.95, `amp` 0.05–0.4, `sp` 0.4–1.7, `warm` p = 0.10, `rad = sqrt(u)`; haze `rad` 0.5–1, `off` ±45 px, `r` 0.3–1.0, `base` 0.04–0.16, `sp` 0.3–1.0.
- [ ] **Step 5: Run to verify pass.** `npm run test && npm run lint && npm run build`. Expected: green.
- [ ] **Step 6: Commit.** `git add celestium-spa/src/lib && git commit -m "feat(sky): model clock and seeded starfield"`

---

### Task 3: Scene, routes, theme scoping

**Files:**
- Create: `celestium-spa/src/components/Sky/drawSky.ts`, `celestium-spa/src/components/Sky/SkyScene.tsx`, `celestium-spa/src/pages/Landing.tsx`
- Modify: `celestium-spa/src/App.tsx`, `celestium-spa/src/index.css`, `celestium-spa/tailwind.config.cjs`

**Interfaces:**
- Consumes: Task 1 (`skyAt`, `dayFraction`, `meridianLongitude`, `screenAngle`, `terminatorX`, `constellationAtLongitude`, `SkySnapshot`), Task 2 (`stepModelTime`, `FROZEN_MODES`, `SkyMode`, `buildStarfield`, `starCount`, `Starfield`).
- Produces:
  ```ts
  // drawSky.ts
  export interface SkyFrame { sky: SkyState; meridianLon: number; showYou: boolean; twinkleT: number; starfield: Starfield }
  export function drawSky(ctx: CanvasRenderingContext2D, view: { w: number; h: number }, frame: SkyFrame): void;
  // SkyScene.tsx
  export function SkyScene(props: { mode: SkyMode; reduced: boolean; onSnapshot: (s: SkySnapshot) => void }): ReactElement;
  ```

- [ ] **Step 1: Tokens and scoping.** `tailwind.config.cjs` → `theme.extend.colors.night = { bg, text, dim, sun, moon }` (palette above; named `night`, because `sky` collides with Tailwind's built-in scale) and `fontFamily['sky-serif'] = ['"Iowan Old Style"','"Palatino Linotype"','Palatino','Georgia','serif']`, `['sky-mono'] = ['"SFMono-Regular"','"JetBrains Mono"','Menlo','Consolas','monospace']`. `index.css` → append `html[data-theme="sky"] body::before, html[data-theme="sky"] body::after { display: none; }` and `html[data-theme="sky"] header { animation: none; }` (grain, scanlines and header flicker are HUD-only; the PRD rejects that look for the landing).
- [ ] **Step 2: Implement `drawSky.ts`** by porting prototype L358–447, with these differences: (1) every star/haze/label/Sun/Moon angle is `screenAngle(lon, frame.meridianLon)` (replaces `lon + diurnal`); (2) highlighted constellations: Sun's = `constellationAtLongitude(sky.sunLon)`, overhead = `constellationAtLongitude(meridianLon)`; (3) "you" dot fixed at angle 0 on Earth's rim, drawn only if `showYou`; (4) lit shapes = sun-side half-disc bounded by a terminator half-ellipse with x-semi-axis `|terminatorX(elong, r)|` (sign picks crescent vs gibbous; Earth uses `elong = 90`, a straight terminator); lit side faces the Sun's screen position as in the prototype; (5) star position radius `rad · hypot(w,h)/2`; twinkle uses `twinkleT` (0 ⇒ static).
- [ ] **Step 3: Implement `SkyScene.tsx`.** `<canvas role="img" aria-label="Live model of the sky: Earth at the centre, the Sun and Moon orbiting it, the constellations wheeling past">` filling its container; `ResizeObserver`; DPR `min(devicePixelRatio, 2)` + `setTransform`; starfield built once (`useMemo`, `buildStarfield(1, starCount(2560, 1440))`) and drawn as `slice(0, starCount(w, h))`. One rAF loop per mount, cancelled on unmount: `modelMs = stepModelTime(modelMs, ts − last, mode, Date.now())` → `skyAt` → live modes (`now`/`day`/`pause`): `dayFrac = dayFraction(date)`, `meridianLon = meridianLongitude(sunLon, dayFrac)`; frozen modes (`frozen = FROZEN_MODES.has(mode)`): reuse the `{dayFrac, meridianLon}` pinned at entry and ease back to live on exit (D3c); `showYou = !frozen`. Latest `mode`/`reduced` are read from refs written in effects. Call `onSnapshot` at most every 125 ms. `twinkleT = reduced ? 0 : ts / 1000`.
- [ ] **Step 4: `Landing.tsx` + routes.** Landing sets `document.documentElement.dataset.theme = 'sky'` in an effect (removed on cleanup), renders `<SkyScene mode="now" reduced={false} onSnapshot={() => {}} />` plus a temporary `<Link to="/cosmos">`. `App.tsx`: `/` → `Landing`, `/cosmos` → `Dashboard`, `/help` unchanged, `*` → `/`. Landing must not use a `<header>` element.
- [ ] **Step 5: Gates.** `npm run lint && npm run test && npm run build`. Expected: green.
- [ ] **Step 6: Boundary greps.** `grep -rnE "useCelestium|useGeolocation|useSolar|EQUINOX_TABLE" src/components/Sky src/pages/Landing.tsx`. Expected: no output (Review Focus 2).
- [ ] **Step 7: Playwright (user starts `npm run dev`).** (a) `/`: canvas present, no console errors, `getComputedStyle(document.body, '::after').display === 'none'`. (b) `/cosmos`: HUD renders unchanged (CLAUDE.md checklist 1–3, 6–8). (c) `/help` loads; `/nope` → `/`. (d) With the page clock fixed (Playwright `page.clock.setFixedTime`) at local 12:00 and 00:00, screenshots show the Sun glow at the top vs the bottom, and the "you" dot on the lit vs the dark hemisphere. (e) Resize 390×844 → 390×760: no console errors; star pattern unchanged.
- [ ] **Step 8: Commit.** `git add celestium-spa && git commit -m "feat(sky): canvas scene at / with HUD moved to /cosmos"`

---

### Task 4: Overlay, controls, accessibility

**Files:**
- Create: `celestium-spa/src/components/Sky/SkyOverlay.tsx`
- Modify: `celestium-spa/src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `SkySnapshot`, `SkyMode`, `MODE_LABEL`, `constellationAtLongitude`, `useReducedMotion` from `framer-motion`.
- Produces: `export function SkyOverlay(props: { snapshot: SkySnapshot | null; mode: SkyMode; onModeChange: (m: SkyMode) => void }): ReactElement`

- [ ] **Step 1: Implement `SkyOverlay.tsx`** (Tailwind, `night-*` tokens, `font-sky-serif` / `font-sky-mono`, tabular numerals). Copy, verbatim from the prototype: wordmark "Celestium", tagline "We do not watch the clock. We watch the sky.", controls label "Watch a rhythm pass", caption "Geocentric living model · accelerated · positions approximate". Content: readout = 12-hour `h:mm:ss` + `AM|PM` from `snapshot.date`; `ρ` + `floor(dayFrac·360)` padded to 3 + `°`; date via `Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })`; `MODE_LABEL[mode]`. Sentence = `Sun in {X} · {phaseWord} Moon in {Y}` plus ` · {Z} overhead` only when `!snapshot.frozen`; names title-cased (`Scorpius`). Controls = NOW · DAY · MONTH · YEAR · ❚❚ (`aria-pressed`, `aria-label="Pause"`, `min-height: 44px`). Nav = "Open the instrument →" (`/cosmos`) and "Manifesto" (`/help`) via React Router `Link`. Add `data-sky="readout" | "sentence" | "controls" | "nav"` on the four blocks. Text blocks are not live regions.
- [ ] **Step 2: Wire `Landing.tsx`.** `useState<SkyMode>('now')`, `useState<SkySnapshot | null>(null)`, `reduced = useReducedMotion() ?? false` passed to `SkyScene`; render `SkyOverlay`; remove the temporary link.
- [ ] **Step 3: Gates.** `npm run lint && npm run test && npm run build`. Expected: green.
- [ ] **Step 4: Playwright.** (a) Click DAY: after ~5 s the wheel has rotated; modeline equals `MODE_LABEL.day`; only DAY has `aria-pressed="true"`. (b) Click YEAR for 34 s: the "Sun in …" name takes ≥ 5 distinct values, the clock/ρ text stays constant while the date advances, the "overhead" clause is absent, "you" is hidden. (c) `browser_emulate_media` reduced motion: twinkle frozen, DAY/MONTH/YEAR still enabled. (d) Rect check via `browser_evaluate`: no pairwise intersection among the four `[data-sky]` blocks and every button `height ≥ 44` at 320×568, 390×844, 1280×800. (e) Contrast: dim text on `#05070f` ≥ 4.5:1.
- [ ] **Step 5: Commit.** `git add celestium-spa && git commit -m "feat(sky): overlay, time-warp controls, reduced-motion"`

---

### Task 5: HUD hand-off, docs, gates

**Files:**
- Modify: `celestium-spa/src/pages/Help.tsx`, `celestium-spa/src/pages/Dashboard.tsx`, `CLAUDE.md`, `docs/prd/living-sky.md`
- Create (only if D5 = switch): `celestium-spa/src/hooks/useSunConstellation.ts`

**Interfaces:**
- Consumes: `skyAt`, `constellationAtLongitude`.
- Produces (only if D5 = switch): `export function useSunConstellation(): string` — 1 s tick, `constellationAtLongitude(skyAt(new Date()).sunLon)`; the Dashboard keeps `'UNKNOWN SECTOR'` while `solar.isNull`.

- [ ] **Step 1: Reciprocal links.** `Help.tsx` back link `to="/"` → `to="/cosmos"` (label "[ BACK TO DASHBOARD ]" stays accurate). `Dashboard.tsx` footer: add `[ ◀ SKY ]` `Link to="/"` beside `[ SYSTEM MANUAL ]`, same classes.
- [ ] **Step 2 (only if D5 = switch): HUD true-sky constellation.** Add `useSunConstellation`; replace `useConstellation(solar.arc)` at `Dashboard.tsx:41` with it (keep the `solar.isNull` → `'UNKNOWN SECTOR'` behavior). Gate: `npm run lint` (the hook must not call `new Date()` in render).
- [ ] **Step 3: Docs.** `CLAUDE.md`: routes (`/` Landing, `/cosmos` Dashboard), the `lib/sky*` + `components/Sky` layout, "the landing intentionally does not use `useCelestium()`", Vitest command. `docs/prd/living-sky.md`: close Q1 (scoped to landing in v1), Q3 (supersedes PR #8; HUD at `/cosmos`), Q4 (NOW).
- [ ] **Step 4: Full gates.** `npm run lint && npm run test && npm run build`; Playwright CLAUDE.md checklist 1–8 on `/cosmos`, plus deep-link reload of `/cosmos` under `npm run preview`. Expected: green, no console errors.
- [ ] **Step 5: Bundle gate.** Main chunk gzip ≤ baseline + 10 kB. If over: `React.lazy` the `Dashboard` and `Help` routes (`Suspense fallback={null}`) and re-measure.
- [ ] **Step 6: Commit, then PR notes.** `git commit -m "feat: hand-off links, docs"`. In the PR description: screenshots (NOW, DAY, YEAR; 390×844 and 1280×800), the D3 defect list, and "supersedes #8" (closing #8 is the owner's call).

---

## Out of scope

Heliocentric toggle (Q2); precession / Great Year (§13); location-aware first-person sky; in-scene cosmic events; extending `EQUINOX_TABLE`; swapping the OG image (`dashboard.png` shows the HUD, not the new landing); propagating the softer aesthetic to the HUD (Q1).

## As built (execution notes)

Deviations from the plan, each decided during execution:

- `lib/sky.ts` gained `constellationSectors()` (+3 tests): the prototype placed every ring label one sector off (it used a constellation's start as its sector end), so the highlighted Sun label never sat at the Sun.
- New `lib/skyFormat.ts` (+9 tests) for the overlay's 12-hour clock, ρ padding and title-casing. The clock derives from the pinned `dayFrac`, not the model date, so it stays constant in MONTH/YEAR.
- Ring labels switch to 3-letter abbreviations below 560 px canvas width; the "overhead" ring highlight is hidden in frozen modes.
- The `[ ◀ SKY ]` back link sits in the HUD header's top-left, not the footer: in the footer it wrapped "[ SYSTEM MANUAL ]" and shrank the visualizer (576 → 563 px at 1280×800). The HUD layout is now identical to baseline.
- `SkyScene` repaints inside its ResizeObserver callback: resizing clears the bitmap and the next rAF runs after paint, so every resize flashed a blank frame (found in review; probe RED 0 % → GREEN 100 % opaque).
- D5 stayed at its default: the HUD still derives its constellation from α (documented in `CLAUDE.md`). `npm ci` was skipped (baseline already measured), no push and no PR.

Verified: 60 Vitest tests; lint and build green; main chunk 174.16 kB gzip (+4.4 kB over the 169.76 kB baseline). Playwright (dev server and production preview): day/night sweep, overhead constellation, DAY / YEAR / MONTH behaviour, reduced motion, no overlay overlap at 320×568 / 390×844 / 1280×800, contrast ≥ 5.2:1, HUD checklist, `/cosmos` deep-link reload.

Not verified: frame rate on a real phone; independent (fresh-context) code review.
