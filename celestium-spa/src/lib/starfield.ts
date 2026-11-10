// Seeded, prefix-stable starfield for the Living Sky.
// Positions are normalized (rad is a fraction of the sky radius) so a resize
// only rescales; every element consumes a fixed number of PRNG draws, so the
// first N stars are identical whatever the total count.

export interface Star {
    lon: number;   // degrees on the celestial sphere, [0,360)
    rad: number;   // fraction of the sky radius, [0,1]
    r: number;     // dot radius, px
    base: number;  // base opacity
    amp: number;   // twinkle amplitude
    sp: number;    // twinkle speed
    ph: number;    // twinkle phase
    warm: boolean;
}

export interface Haze {
    lon: number;
    rad: number;   // fraction of the sky radius, [0.5,1]
    off: number;   // band spread, px (±45)
    r: number;
    base: number;
    sp: number;
    ph: number;
}

export interface Starfield { stars: Star[]; haze: Haze[] }

export function starCount(w: number, h: number): number {
    return Math.round((w * h) / 4200);
}

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function buildStarfield(seed: number, count: number): Starfield {
    const rs = mulberry32(seed);
    const rh = mulberry32(seed ^ 0x9e3779b9); // independent stream: haze never shifts stars
    const range = (rand: () => number, a: number, b: number) => a + rand() * (b - a);

    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            lon: range(rs, 0, 360),
            rad: Math.sqrt(rs()),            // even fill of the disk
            r: range(rs, 0.4, 1.7),
            base: range(rs, 0.2, 0.95),
            amp: range(rs, 0.05, 0.4),
            sp: range(rs, 0.4, 1.7),
            ph: range(rs, 0, Math.PI * 2),
            warm: rs() < 0.1,
        });
    }

    const haze: Haze[] = [];
    const hazeCount = Math.round(count * 0.7);
    for (let i = 0; i < hazeCount; i++) {
        haze.push({
            lon: range(rh, 0, 360),
            rad: 0.5 + rh() * 0.5,
            off: (rh() - 0.5) * 90,
            r: range(rh, 0.3, 1.0),
            base: range(rh, 0.04, 0.16),
            sp: range(rh, 0.3, 1.0),
            ph: range(rh, 0, Math.PI * 2),
        });
    }
    return { stars, haze };
}
