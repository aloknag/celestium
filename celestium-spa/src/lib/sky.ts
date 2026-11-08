import * as Astronomy from 'astronomy-engine';
import { CONSTELLATIONS } from '../hooks/useConstellation';

// Pure sky math for the Living Sky landing. All angles are degrees in [0,360).
// Screen convention: 0 = top, increasing clockwise.

export type PhaseWord =
    | 'new' | 'waxing crescent' | 'first-quarter' | 'waxing gibbous'
    | 'full' | 'waning gibbous' | 'last-quarter' | 'waning crescent';

export interface SkyState {
    sunLon: number;   // ecliptic longitude of the Sun, of date
    moonLon: number;  // sunLon + elong
    elong: number;    // Moon − Sun ecliptic longitude: 0 new, 180 full
    illum: number;    // illuminated fraction 0..1
    waxing: boolean;  // elong < 180
    phaseWord: PhaseWord;
}

export interface SkySnapshot {
    date: Date;
    dayFrac: number;       // displayed time-of-day (pinned in frozen modes)
    sky: SkyState;
    meridianLon: number;   // ecliptic longitude at the top of the screen
    frozen: boolean;       // MONTH / YEAR: wheel + clock pinned
}

const DEG = Math.PI / 180;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

export function phaseWordAt(elong: number): PhaseWord {
    const frac = norm360(elong) / 360;
    if (frac < 0.03 || frac > 0.97) return 'new';
    if (frac < 0.22) return 'waxing crescent';
    if (frac < 0.28) return 'first-quarter';
    if (frac < 0.47) return 'waxing gibbous';
    if (frac < 0.53) return 'full';
    if (frac < 0.72) return 'waning gibbous';
    if (frac < 0.78) return 'last-quarter';
    return 'waning crescent';
}

export function skyAt(date: Date): SkyState {
    const sunLon = norm360(Astronomy.SunPosition(date).elon);
    const elong = norm360(Astronomy.MoonPhase(date));
    return {
        sunLon,
        moonLon: norm360(sunLon + elong),
        elong,
        illum: (1 - Math.cos(elong * DEG)) / 2,
        waxing: elong < 180,
        phaseWord: phaseWordAt(elong),
    };
}

// Same lookup as useConstellation(), on a real longitude. Below Aries (29°) the
// Sun is still in the Pisces sector that wraps through 0°.
export function constellationAtLongitude(lon: number): string {
    const l = norm360(lon);
    const match = [...CONSTELLATIONS].reverse().find(c => c.start <= l);
    return match ? match.name : 'PISCES';
}

export interface Sector { name: string; abbr: string; start: number; end: number; mid: number }

// The 13 IAU sun-path sectors as [start,end) longitudes. `end` exceeds 360 for the
// Pisces sector that wraps through 0°; `mid` is normalized to [0,360).
export function constellationSectors(): Sector[] {
    const list = CONSTELLATIONS.slice(1); // drop the duplicate "loop start" Pisces
    return list.map((c, i) => {
        const end = i + 1 < list.length ? list[i + 1].start : list[0].start + 360;
        return { name: c.name, abbr: c.abbr, start: c.start, end, mid: norm360((c.start + end) / 2) };
    });
}

// Local wall-clock fraction of the day, so ρ agrees with the displayed time.
export function dayFraction(date: Date): number {
    const secs = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
        + date.getMilliseconds() / 1000;
    return secs / 86400;
}

// Ecliptic longitude on the local meridian: anti-solar at midnight, solar at noon.
export function meridianLongitude(sunLon: number, dayFrac: number): number {
    return norm360(sunLon + 180 + 360 * dayFrac);
}

// Mirror view (east on the right): the meridian longitude sits at the top and longitudes
// increase clockwise, like the HUD ring. The daily wheel therefore turns anticlockwise
// while the Sun and Moon drift clockwise against the stars.
export function screenAngle(lon: number, meridianLon: number): number {
    return norm360(lon - meridianLon);
}

// x of the terminator at the disc's centre line, measured toward the Sun:
// +r at new (hugging the limb), 0 at quarter (straight), −r at full.
export function terminatorX(elong: number, r: number): number {
    return r * Math.cos(elong * DEG);
}
