# Plan: Clock-First On-Ramp for Celestium

> Status: Proposed (planning only — no implementation in this PR)
> Audience: Curious newcomers
> Direction: Clock-first on-ramp

## Context

Celestium is conceptually powerful but hard for a normal calendar/clock user to
adopt. The dashboard opens on the full "God String"
(`175k :: 358° . 091 . 06 | 203.03°`) and the orbital HUD with **no bridge to
anything familiar**, and the teaching content lives on a separate `/help`
manifesto — so the main screen never onboards anyone.

This change introduces a gentle **on-ramp** aimed at **curious newcomers**: lead
with a familiar **clock** — the one daily habit everyone already shares —
expressed as Celestium's Rotation (ρ), with the ordinary local time shown right
beside it as a "Rosetta" anchor. Rotation is the easiest of the five coordinates
to convert first; once the clock feels natural, the user can step into the full
cosmic HUD.

**Decision (confirmed with user):** the Clock becomes the **default landing at
`/`**; the existing full HUD moves to `/cosmos`, with clear navigation both ways.

## Approach

A new clock-first page that reuses the existing `useCelestium()` data flow, plus a
new dedicated `ClockFace` SVG component. **No domain math changes** — ρ already
exists in `useRotation()`.

### 1. New component: `src/components/HUD/ClockFace.tsx`
A **24-hour "sun dial"** (one full turn = one day = 360° = ρ). Geometry kept
self-contained (matches the convention used by `Visualizer.tsx`), primitive props
only: `rotation: number` (ρ in degrees), `mode`, optional `isNull`.

- Cardinal labels straight from `philosophy.md` so the dial *teaches* the mapping:
  - **0° / 360° = Midnight (Nadir)** → bottom
  - **90° = Sunrise (Ascension)** → right (east)
  - **180° = Noon (Zenith)** → top
  - **270° = Sunset (Descension)** → left (west)
  - This east-right / west-left layout matches the real sky and reads intuitively.
- A single "sun" hand pointing at the current ρ, animated with Framer Motion
  (reuse the rotating `<motion.g>` pattern from `Visualizer.tsx` ~L283–299).
  Screen mapping: hand rotation `= 180 - ρ` (clockwise from top).
- Hour ticks every 15° (24 ticks) with the 4 cardinals emphasized.
- Use palette tokens (`celestium-observer` cyan for the spin, `celestium-solar`
  gold accents) and existing glow filters — no new colors.

### 2. New page: `src/pages/Clock.tsx`
Composes the on-ramp. Reuses `useCelestium()` for `rotation`, `mode`,
`toggleMode`, `geoStatus`, `solar.season`. Adds a small local-time helper using
**Luxon** (already a dependency) for the familiar `h:mm:ss a` readout — read
`DateTime.now()` directly for trust/accuracy; do **not** re-derive from ρ.

Layout (newcomer-first, minimal):
- **Dual "Rosetta" readout** (the centerpiece):
  - Familiar: `2:50:13 PM` (large; reuse `SlotCounter` for the digits).
  - Celestium: `ρ 203.03°` directly beneath, visually equated (`=`), plus a
    one-line plain-language gloss derived from which cardinal quadrant ρ is in,
    e.g. *"203° through today's full turn — past noon, heading to sunset."*
- **`ClockFace`** dial.
- **Mode toggle (the "aha")**: Standard (your phone's time) ↔ True Solar, with one
  line on why it matters ("True Solar shows when the Sun is *actually* over you,
  ignoring time-zone politics"). Reuse existing `toggleMode` + the geolocation
  safety-eject already in `useCelestium()`. Reuse the geo status text pattern from
  `SidePanel.tsx` (TRIANGULATING / SIGNAL LOCKED / …).
- **Single forward CTA**: `[ SEE THE WHOLE SKY → ]` → `/cosmos`.
- Styling consistent with the app: `font-mono`, `bg-celestium-bg`, `panel-glass`,
  glow utilities; scanline/grain already applied globally via `index.css`.

### 3. Routing: `src/App.tsx`
- `/` → `Clock` (new default on-ramp)
- `/cosmos` → existing `Dashboard` (component unchanged)
- `/help` → `Help` (unchanged)
- `*` → redirect to `/`
- Reciprocal links: Clock → `/cosmos` (the CTA) and `/help`; add a `[ ◀ CLOCK ]`
  link to the Dashboard footer (next to the existing `[ SYSTEM MANUAL ]`).

### 4. Optional tiny helper
If the quadrant-phrase / local-time logic grows, extract
`src/hooks/useLocalClock.ts` (Luxon-based: hours, minutes, seconds, ampm).
Otherwise keep it inline in `Clock.tsx`. No new dependencies.

## Out of scope (deliberately)
- No changes to `useSolar` / `useLunar` / `useRotation` math or `EQUINOX_TABLE`.
- No changes to the orbital `Visualizer`, `SidePanel`, `RightPanel` internals.
- Not building the other discussed directions (in-context glyph tooltips, full
  dual-calendar Rosetta for arc/phase, relatable-event hooks) — those are
  follow-ups if this on-ramp lands well.

## Critical files
- **New**: `celestium-spa/src/components/HUD/ClockFace.tsx`
- **New**: `celestium-spa/src/pages/Clock.tsx`
- **New (optional)**: `celestium-spa/src/hooks/useLocalClock.ts`
- **Edit**: `celestium-spa/src/App.tsx` (routes + redirect)
- **Edit**: `celestium-spa/src/pages/Dashboard.tsx` (add back-to-Clock link)
- **Reuse**: `useCelestium.ts`, `SlotCounter.tsx`, Luxon, palette tokens in
  `tailwind.config.cjs`, glow utilities in `index.css`.

## Verification
From `celestium-spa/`, in order (per repo convention in CLAUDE.md):
1. `npm run lint`
2. `npm run build` (tsc strict — watch `noUnusedLocals` / `noUnusedParameters`)
3. Playwright MCP smoke tests (user starts `npm run dev`; do not auto-start):
   - `/` renders the Clock on-ramp; no console errors.
   - Dual readout: familiar local time matches the device clock; `ρ` updates live
     and equals the dashboard's rotation value.
   - Dial hand sits in the correct quadrant for the current time (e.g. afternoon →
     between Noon-top and Sunset-left).
   - Mode toggle Standard ↔ True Solar updates the readout/label and triggers the
     geo flow; denying location safely reverts to Standard (existing behavior).
   - CTA navigates to `/cosmos`; full HUD still works there; back-link returns to `/`.
   - `/help` still reachable; `*` redirects to `/`.
   - Responsive: desktop (1280×800) no vertical overflow; mobile column intact.
