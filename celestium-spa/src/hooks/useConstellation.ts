// src/hooks/useConstellation.ts

// The IAU (International Astronomical Union) boundaries for the Sun's path.
// The Sun passes through 13 constellations, not 12. (Hello, Ophiuchus).
export const CONSTELLATIONS = [
    { name: "PISCES", abbr: "PIS", start: 351 },      // Loop start
    { name: "ARIES", abbr: "ARI", start: 29 },
    { name: "TAURUS", abbr: "TAU", start: 54 },
    { name: "GEMINI", abbr: "GEM", start: 90 },
    { name: "CANCER", abbr: "CAN", start: 118 },
    { name: "LEO", abbr: "LEO", start: 138 },
    { name: "VIRGO", abbr: "VIR", start: 174 },
    { name: "LIBRA", abbr: "LIB", start: 218 },
    { name: "SCORPIUS", abbr: "SCO", start: 241 },
    { name: "OPHIUCHUS", abbr: "OPH", start: 248 },   // The 13th Sign (The Serpent Bearer)
    { name: "SAGITTARIUS", abbr: "SAG", start: 266 },
    { name: "CAPRICORNUS", abbr: "CAP", start: 299 },
    { name: "AQUARIUS", abbr: "AQU", start: 327 },
    { name: "PISCES", abbr: "PIS", start: 351 }       // Loop end
];

export function useConstellation(solarArcString: string | null) {
    if (!solarArcString || solarArcString === "NULL") return "UNKNOWN SECTOR";

    const arc = parseFloat(solarArcString);

    // Find the constellation where the start degree is <= current arc
    // We reverse the array to find the "highest start degree below arc"
    const match = [...CONSTELLATIONS].reverse().find(c => c.start <= arc);

    // Edge case for the Pisces wrap-around (0-29 degrees)
    if (!match && arc < 29) return "PISCES";

    return match ? match.name : "UNKNOWN";
}
