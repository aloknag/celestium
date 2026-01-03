import { AEON, EPOCH } from '../lib/astronomy';
import { useSolar } from './useSolar';
import { useLunar } from './useLunar';
import { useRotation } from './useRotation';
import { useGeolocation } from './useGeolocation';
import { useStore } from '../store/store';

export function useCelestium() {
    const { mode, setMode } = useStore();
    const solar = useSolar();
    const lunarPhase = useLunar();

    // Initialize Geolocation
    const geo = useGeolocation();

    // Pass Geo data to Rotation Engine
    const rotation = useRotation({
        mode,
        latitude: geo.latitude,
        longitude: geo.longitude
    });

    // Handle Mode Switching with Geo Request
    const toggleMode = () => {
        if (mode === 'STANDARD') {
            geo.requestLocation(); // Ask for permission
            setMode('TRUE_SOLAR');
        } else {
            setMode('STANDARD');
        }
    };

    const formattedArc = solar.isNull ? "NULL    " : solar.arc?.padStart(7, '0');

    // "God String"
    const godString = `${AEON} :: ${EPOCH} . ${solar.isNull ? 'NULL' : Math.floor(parseFloat(solar.arc || "0"))} . ${lunarPhase} | ${rotation}°`;
    const fullString = `${AEON} :: ${EPOCH} . ${formattedArc} . ${lunarPhase} | ${rotation}°`;

    return {
        aeon: AEON,
        epoch: EPOCH,
        solar,
        lunarPhase,
        rotation,
        mode,
        toggleMode,
        geoStatus: geo,
        godString,
        fullString
    };
}
