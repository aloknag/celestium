import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export function useRotation(mode: 'STANDARD' | 'TRUE_SOLAR' = 'STANDARD') { // Mode unused in v1
    const [rotation, setRotation] = useState("000.000");

    useEffect(() => {
        let frameId: number;

        const tick = () => {
            const now = DateTime.now(); // Local time for "Standard Mode"
            // Calculate seconds since Midnight
            const startOfDay = now.startOf('day');
            const diff = now.diff(startOfDay, 'seconds').seconds;

            // Map 86400 seconds -> 360 degrees
            const deg = (diff / 86400) * 360;

            setRotation(deg.toFixed(3));

            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [mode]);

    return rotation;
}
