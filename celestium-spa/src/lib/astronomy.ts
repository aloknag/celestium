

export const AEON = "175k";
export const EPOCH = "358°";

// Table of Vernal Equinoxes (Start of Celestium Year)
// Format: UTC ISO Strings
export const EQUINOX_TABLE = [
    { year: 2024, timestamp: "2024-03-20T03:06:00Z" },
    { year: 2025, timestamp: "2025-03-20T09:01:00Z" },
    { year: 2026, timestamp: "2026-03-20T14:46:00Z" },
    { year: 2027, timestamp: "2027-03-20T20:25:00Z" },
    { year: 2028, timestamp: "2028-03-20T02:17:00Z" },
];

export interface CelestiumDate {
    solarArc: string; // "360.000" or "NULL"
    rotation: string; // "180.000"
    lunarPhase: number; // 0-29
    isNull: boolean;
    countdown: string | null;
}
