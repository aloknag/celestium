import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import SunCalc from 'suncalc';

interface RotationProps {
    mode: 'STANDARD' | 'TRUE_SOLAR';
    latitude: number | null;
    longitude: number | null;
}

export function useRotation({ mode, latitude, longitude }: RotationProps) {
    const [rotation, setRotation] = useState("000.000");

    useEffect(() => {
        let frameId: number;

        const tick = () => {
            const now = DateTime.now();

            if (mode === 'TRUE_SOLAR' && latitude !== null && longitude !== null) {
                // --- TRUE SOLAR MATH ---
                // 1. Get the exact moment of Solar Noon for this location
                // SunCalc expects JS Date
                const times = SunCalc.getTimes(now.toJSDate(), latitude, longitude);
                const solarNoon = DateTime.fromJSDate(times.solarNoon);

                // 2. Calculate offset from Noon (180 degrees)
                // If it's 12:00 PM but Solar Noon is 1:30 PM, we are -90 mins behind zenith.
                const diffSeconds = now.diff(solarNoon, 'seconds').seconds;

                // 3. Map Time to Degrees
                // 86400 seconds = 360 degrees
                // Rotation = 180 (Zenith) + (Difference * DegPerSec)
                let deg = 180 + (diffSeconds * (360 / 86400));

                // Normalize 0-360
                if (deg >= 360) deg -= 360;
                if (deg < 0) deg += 360;

                setRotation(deg.toFixed(3));

            } else {
                // --- STANDARD MATH ---
                // Political wall-clock time
                const startOfDay = now.startOf('day');
                const diff = now.diff(startOfDay, 'seconds').seconds;

                // Map 86400 seconds -> 360 degrees
                const deg = (diff / 86400) * 360;
                setRotation(deg.toFixed(3));
            }

            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [mode, latitude, longitude]);

    return rotation;
}
