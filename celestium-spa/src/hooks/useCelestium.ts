import { AEON, EPOCH } from '../lib/astronomy';
import { useSolar } from './useSolar';
import { useLunar } from './useLunar';
import { useRotation } from './useRotation';
import { useStore } from '../store/store';

export function useCelestium() {
    const { mode, setMode } = useStore();
    const solar = useSolar();
    const lunarPhase = useLunar();
    const rotation = useRotation(mode);

    const formattedArc = solar.isNull ? "NULL    " : solar.arc?.padStart(7, '0'); // Pad to same length "360.000"

    // "God String"
    // Format: 175k :: 358° . [ARC] . [MOON] | [ROTATION]
    const godString = `${AEON} :: ${EPOCH} . ${solar.isNull ? 'NULL' : Math.floor(parseFloat(solar.arc || "0"))} . ${lunarPhase} | ${rotation}°`;

    // Full detail string if needed
    const fullString = `${AEON} :: ${EPOCH} . ${formattedArc} . ${lunarPhase} | ${rotation}°`;

    return {
        aeon: AEON,
        epoch: EPOCH,
        solar,
        lunarPhase,
        rotation,
        mode,
        setMode,
        godString,
        fullString
    };
}
