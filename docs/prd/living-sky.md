# PRD — Celestium "Living Sky" Landing

> Status: Draft for review · Owner: @aloknag · Type: New landing experience
> Reference implementation: [`prototypes/clock-night-sky.html`](../../prototypes/clock-night-sky.html) (self-contained, open in a browser)

---

## 1. Summary

Replace Celestium's cold, HUD-style entry point with a **living model of the sky**:
Earth at the center, the Sun and Moon orbiting it, the wheel of real
constellations turning, against a field of twinkling stars. It is a calm,
"close to nature" experience whose job is to make a newcomer *feel* — in a few
seconds — that they live on a spinning planet inside a larger clockwork, and
that **the sky itself is the original, honest clock and calendar.**

The clock/coordinate readout (local time = Celestium's coordinates) rides quietly
on top of the scene, so the familiar and the cosmic are always shown together.

## 2. Background & problem

Celestium reframes time as **position in space rather than a political label** —
"we don't ask *what time is it?*, we ask *where are we?*" (see `philosophy.md`).
Today the app opens directly on the dense "God String" and a cyberpunk HUD
(neon, scanlines, "SIGNAL LOCKED"), which:

- gives a newcomer **no bridge to anything familiar**, and
- feels **technological and arbitrary** — the opposite of the natural, grounded
  feeling the project is trying to evoke.

We need an entry experience that is **inviting, legible, and emotionally
resonant**, and that *teaches the concept by showing it move*.

## 3. Goals & non-goals

**Goals**
- G1. Make the relationship between Earth, Sun, Moon, and the constellations
  immediately *visible and intuitive*.
- G2. Show that the **day, month, and year are three real motions in the sky**,
  not abstract units.
- G3. Always anchor the cosmic view to the **familiar clock/date** so newcomers
  can map old → new.
- G4. Establish a **calm, elegant, nature-led aesthetic** distinct from the
  current HUD.

**Non-goals**
- N1. Astronomical/ephemeris-grade precision (this is an evocative model, not a
  planetarium).
- N2. Astrology. We use **IAU constellations** (13, incl. Ophiuchus), never the
  12 zodiac signs (`philosophy.md` is explicit on this).
- N3. Replacing the existing full dashboard/HUD — it remains, reachable from here.
- N4. 3D/WebGL. The scene is achievable in 2D and must stay light for mobile/PWA.

## 4. Target user

**Curious newcomers** — people fluent in the normal clock/calendar with no
astronomy background. The experience must reward a 5-second glance and invite a
longer, playful exploration, without requiring any prior knowledge.

## 5. The concept

A **geocentric "living model"** — deliberately the naive, look-up-from-the-ground
point of view, because that's how time is *experienced*:

- **Earth** at center, with a day/night terminator that faces the Sun and a
  "you are here" marker riding its surface (sweeping from night into day).
- **Sun** and **Moon** orbiting Earth along the ecliptic; the Moon shown in its
  **real current phase**, lit side toward the Sun.
- A **ring of the 13 IAU constellations** marking the Sun's path.
- A field of **background stars** + a faint **Milky Way**, forming the celestial
  sphere that turns overhead.

### The core insight — three motions = three timescales

This is the heart of the product. Each motion *is* a unit of time:

| Motion on screen | Natural rhythm | Celestium coordinate |
| :-- | :-- | :-- |
| The star/constellation wheel turns once; Earth's terminator rotates; the "you" dot crosses into daylight | **the day** | ρ Rotation |
| The Moon orbits Earth and its phase changes | **the month** | λ Lunar Phase |
| The Sun walks through the constellations | **the year** | α Solar Arc |

The scene reads as a sentence, e.g. *"Sun in Taurus · waning gibbous Moon in
Sagittarius · Gemini overhead"* — time expressed as **places you can point at.**

## 6. Functional requirements

- **FR1 — Celestial bodies.** Render Earth (center), Sun, and Moon on the
  ecliptic. Moon displays its real current illuminated phase, oriented toward the
  Sun. Earth shows a day/night terminator facing the Sun.
- **FR2 — Constellation ring.** Show the 13 IAU sectors around the ecliptic.
  Highlight (a) the constellation the **Sun is currently in** and (b) the
  constellation currently **overhead**, distinctly from the rest.
- **FR3 — Starfield.** Hundreds of stars + faint Milky Way, gently twinkling,
  fixed to the celestial sphere so they wheel with the daily rotation.
- **FR4 — Diurnal motion.** The whole celestial sphere turns once per day; the
  "you are here" marker tracks local time of day.
- **FR5 — Time-warp controls (key UX).** Because real sky motion is invisible
  over seconds, provide controls to *accelerate time* so each rhythm is
  watchable:
  - **NOW** — real time, real positions (the honest default state).
  - **DAY** — the daily wheel + day/night sweep, ~20s per day.
  - **MONTH** — the Moon's orbit and phase cycle, ~25s per month.
  - **YEAR** — the Sun's walk through the constellations, ~30s per year.
  - **Pause.**
  All driven by a single "model time"; positions stay internally consistent
  across modes.
- **FR6 — Coordinate overlay.** Always show the familiar **local time** and its
  Celestium equivalent (**ρ°**), plus the live constellation sentence (FR2). This
  is the bridge between old and new.
- **FR7 — Accessibility.** Respect `prefers-reduced-motion` (freeze
  twinkle/orbits); maintain legible contrast of overlay text over the scene.
- **FR8 — Responsive.** Works on a mobile portrait viewport and desktop without
  layout breakage; the scene scales to fill.

## 7. UX & interaction

- The **scene is the hero**; the clock readout, constellation sentence, and
  controls are quiet overlays that never fight it for attention.
- **One-glance legibility**, **playful on interaction**: tapping DAY/MONTH/YEAR
  is the "aha" — you literally watch a unit of time go by.
- Entry path: this is the **landing**; a clear, unobtrusive path leads onward to
  the existing full dashboard/HUD (the deeper instrument) and `/help`.

## 8. Visual / aesthetic direction

**Elegant and close to nature — explicitly NOT the current cyberpunk HUD.**
- Mood chosen by user: **real night sky** (deep-indigo stargazing realism).
- Deep indigo/black space gradient; **moonlight silver**, **warm amber sun**;
  thin, faint linework; restraint over density (negative space is the elegance).
- Motion is **slow, breathing, tide-like** — nothing snaps or ticks.
- Typography leans calmer/observatory than terminal (numbers stay tabular for
  stability).
- Open question: whether this softer aesthetic eventually propagates to the rest
  of the app or stays scoped to the landing (see §12).

## 9. Data & accuracy

- **Hybrid accuracy (agreed):** the Moon's **real phase** and the Sun's **real
  seasonal/constellation position** are correct for the current date; orbital
  *speeds and scale* are stylized for visual appeal and legibility.
- Constellation mapping uses IAU ecliptic boundaries (reuse the existing
  `CONSTELLATIONS` data in `src/hooks/useConstellation.ts`).
- The reference prototype uses lightweight approximations (synodic-month phase,
  mean Sun longitude). The production build should source position/phase from the
  app's existing astronomy layer (`suncalc` / `astronomy-engine`, via
  `useCelestium`).

## 10. Technical constraints (for the production React build)

- Stack: React 19 + TypeScript + Vite + Tailwind; **Framer Motion only** for
  animation (CLAUDE.md convention) — **no new animation/3D libraries**.
- Reuse: `useCelestium()` (rotation, solar, lunar, mode, geo), `CONSTELLATIONS`,
  the moon spotlight-mask & rotating-group patterns in `Visualizer.tsx`, palette
  tokens in `tailwind.config.cjs`, glow utilities in `index.css`.
- Rendering: SVG + Framer Motion, or Canvas where many twinkling stars demand it;
  keep the bundle light for the installable PWA.
- Performance: generate the starfield once; cap animated nodes; smooth on mobile.

## 11. Success criteria

- A first-time viewer can, unprompted, articulate that the day/month/year are
  motions of the sky after using the DAY/MONTH/YEAR controls.
- The landing is legible at a glance and inviting enough to explore.
- No console errors; smooth animation on a mid-range phone; reduced-motion honored.

## 12. Open questions

- Q1. Does the calm/nature aesthetic stay scoped to the landing, or become the
  app's new direction overall?
- Q2. Geocentric model only, or also offer a heliocentric "true" view as a toggle?
- Q3. Relationship to the previously-planned **clock-first on-ramp** (PR #8) — is
  the Living Sky the new landing *instead of* the clock dial, or do they layer
  (sky as backdrop, clock in front)?
- Q4. Default mode — NOW (honest/still) or DAY (immediately alive)?

## 13. Future scope (not in v1)

- **Precession / The Great Year (Ω, Σ).** A scrubbable deep-time view: the pole
  star changing (Thuban → Polaris → Vega) and the equinox drifting through the
  constellations — including the "your star sign is off by a whole constellation"
  reveal. Discussed and desired; deferred to a later iteration.
- Location-aware first-person "sky above you right now" mode.
- Notable-event hooks (eclipses, solstices, super/micromoons) surfaced in-scene.

---

### Appendix — the God String this visualizes

`Σ :: Ω . α . λ | ρ`  — Aeon, Epoch (deep time, §13 future), Solar Arc (the Sun's
constellation), Lunar Phase (the Moon), Rotation (the daily wheel). The Living
Sky gives α, λ, and ρ a visible, physical home.
