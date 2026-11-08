// Model time for the Living Sky: one clock that can run fast.

export type SkyMode = 'now' | 'day' | 'month' | 'year' | 'pause';

// Longest real-time step we integrate: a backgrounded tab resumes with a huge dt.
export const MAX_DT_MS = 50;

const SYNODIC_DAYS = 29.530588853;

// Model-seconds per real second. NOW is the truth; the rest are simulated.
export const MODE_SPEED: Record<SkyMode, number> = {
    now: 1,
    day: 86400 / 22,
    month: (SYNODIC_DAYS * 86400) / 26,
    year: (365.25 * 86400) / 34,
    pause: 0,
};

export const MODE_LABEL: Record<SkyMode, string> = {
    now: 'NOW · live sky, real time',
    day: 'DAY · one day in ~22s · simulated',
    month: 'MONTH · one month in ~26s · simulated',
    year: 'YEAR · one year in ~34s · simulated',
    pause: 'PAUSED',
};

// MONTH and YEAR would spin the daily wheel at ~1.1 and ~10.7 rev/s: the scene
// pins the wheel orientation and the displayed clock in these modes instead.
export const FROZEN_MODES: ReadonlySet<SkyMode> = new Set<SkyMode>(['month', 'year']);

// Next model time (epoch ms). NOW follows the wall clock; other modes integrate
// the real-time step, clamped to MAX_DT_MS and never negative.
export function stepModelTime(prevMs: number, dtMs: number, mode: SkyMode, nowMs: number): number {
    if (mode === 'now') return nowMs;
    return prevMs + Math.min(Math.max(dtMs, 0), MAX_DT_MS) * MODE_SPEED[mode];
}
