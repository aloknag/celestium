import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';

export function useLunar() {
    const [lunarPhase, setLunarPhase] = useState("00");

    useEffect(() => {
        // Lunar phase changes slowly, no need for rapid updates
        const update = () => {
            const now = new Date();
            const illumination = SunCalc.getMoonIllumination(now);

            // illumination.phase goes from 0.0 (New) -> 0.25 (1st Q) -> 0.5 (Full) -> 0.75 (Last Q) -> 1.0 (New)
            // We map this to 0-29 scale.

            // [FIX] Use 30-phase system (0-29) based on Hawaiian moon phase tradition
            // Math.floor(0.0 to 0.999 * 30) gives 0-29.
            // Edge case: phase 1.0 would give 30, so we wrap it.
            let phaseIndex = Math.floor(illumination.phase * 30);
            if (phaseIndex >= 30) phaseIndex = 0;

            setLunarPhase(phaseIndex.toString().padStart(2, '0'));
        };

        update();
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return lunarPhase;
}
