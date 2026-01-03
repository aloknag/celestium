import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { EQUINOX_TABLE } from '../lib/astronomy';

export interface SolarState {
    arc: string | null;  // "123.456" or null
    isNull: boolean;
    countdown: string | null; // "4 Days 12 Hours..."
    season: string; // "Winter", "null"
}

export function useSolar(): SolarState {
    const [state, setState] = useState<SolarState>({
        arc: "000.000",
        isNull: false,
        countdown: null,
        season: "Init"
    });

    useEffect(() => {
        const tick = () => {
            const now = DateTime.utc();

            // 1. Find the current/last equinox
            // We look for the latest equinox that is <= now
            let lastEquinox = EQUINOX_TABLE[0];
            let nextEquinox = EQUINOX_TABLE[1];

            for (let i = 0; i < EQUINOX_TABLE.length - 1; i++) {
                const eq = DateTime.fromISO(EQUINOX_TABLE[i].timestamp, { zone: 'utc' });
                if (now >= eq) {
                    lastEquinox = EQUINOX_TABLE[i];
                    nextEquinox = EQUINOX_TABLE[i + 1];
                } else {
                    break; // We passed the target
                }
            }

            const start = DateTime.fromISO(lastEquinox.timestamp, { zone: 'utc' });
            const end = DateTime.fromISO(nextEquinox.timestamp, { zone: 'utc' });

            // 2. Calculate Progress
            const diff = now.diff(start, 'days');
            const daysElapsed = diff.days; // Float

            if (daysElapsed <= 360) {
                // Kinetic Year
                setState({
                    arc: daysElapsed.toFixed(3),
                    isNull: false,
                    countdown: null,
                    season: getSeason(daysElapsed)
                });
            } else {
                // Null Interval
                // Countdown to next equinox
                const timeToNext = end.diff(now);
                // Format countdown: "4d 12h 30m 10s"
                const fmt = timeToNext.toFormat("d'd' h'h' m'm' s's'");

                setState({
                    arc: null,
                    isNull: true,
                    countdown: fmt,
                    season: "Calibration"
                });
            }
        };

        const interval = setInterval(tick, 1000); // Solar arc doesn't need ms precision
        tick(); // Initial call

        return () => clearInterval(interval);
    }, []);

    return state;
}

function getSeason(degree: number): string {
    if (degree < 90) return "Spring (Growth)";
    if (degree < 180) return "Summer (Ascension)";
    if (degree < 270) return "Autumn (Harvest)";
    return "Winter (Dormancy)";
}
