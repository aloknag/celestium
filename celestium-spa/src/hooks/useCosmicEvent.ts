import { useEffect, useState } from 'react';
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';

interface CosmicEvent {
    name: string;
    type: 'ECLIPSE' | 'OPPOSITION' | 'SUPERMOON' | 'MICROMOON' | 'None';
    date: Date;
    formattedDate: string;
    timeUntil: string;
    badge: string;
}

export function useCosmicEvent(lat: number | null, lon: number | null): CosmicEvent | null {
    const [event, setEvent] = useState<CosmicEvent | null>(null);

    useEffect(() => {
        const calculate = () => {
            const now = new Date();
            let bestEvent: CosmicEvent | null = null;
            let minTimeDiff = Infinity;

            // --- 0. GLOBAL EVENTS (Fallback: Solstices & Equinoxes) ---
            // These run regardless of geolocation
            const currentYear = now.getFullYear();
            const seasons = [
                Astronomy.Seasons(currentYear),
                Astronomy.Seasons(currentYear + 1)
            ];

            const seasonNames: Record<string, string> = {
                mar_equinox: 'VERNAL EQUINOX',
                jun_solstice: 'SUMMER SOLSTICE',
                sep_equinox: 'AUTUMNAL EQUINOX',
                dec_solstice: 'WINTER SOLSTICE'
            };

            for (const yearSeasons of seasons) {
                for (const [key, astroTime] of Object.entries(yearSeasons)) {
                    // Astronomy-Engine returns 'AstroTime' objects, need .date
                    const evtDate = astroTime.date;
                    const diff = evtDate.getTime() - now.getTime();

                    // If event is in future and closer than current best
                    if (diff > 0 && diff < minTimeDiff) {
                        minTimeDiff = diff;
                        bestEvent = {
                            name: seasonNames[key] || 'EQUINOX/SOLSTICE',
                            type: 'None', // Generic type
                            date: evtDate,
                            formattedDate: DateTime.fromJSDate(evtDate).toFormat('MMM dd, yyyy HH:mm'),
                            timeUntil: '', // Calculated at end
                            badge: 'SOLAR'
                        };
                    }
                }
            }

            // --- 1. LOCAL EVENTS (High Priority: Eclipses) ---
            // Only runs if we have location
            if (lat !== null && lon !== null) {
                const observer = new Astronomy.Observer(lat, lon, 0);
                const solarEclipse = Astronomy.SearchLocalSolarEclipse(now, observer);

                if (solarEclipse) {
                    const evtDate = solarEclipse.peak.time.date;
                    const diff = evtDate.getTime() - now.getTime();

                    // Prioritize Eclipse if it is sooner than the Season
                    // Or maybe we ALWAYS want to show Eclipse if it's within a reasonable window?
                    // For now, strict time sorting (Next Visible Event)
                    if (diff > 0 && diff < minTimeDiff) {
                        minTimeDiff = diff;
                        bestEvent = {
                            name: solarEclipse.kind === 'total' ? 'TOTAL SOLAR ECLIPSE' : 'PARTIAL SOLAR ECLIPSE',
                            type: 'ECLIPSE',
                            date: evtDate,
                            formattedDate: DateTime.fromJSDate(evtDate).toFormat('MMM dd, yyyy HH:mm'),
                            timeUntil: '',
                            badge: 'SOLAR'
                        };
                    }
                }
            }

            // --- 2. LUNAR EVENTS (Supermoon/Micromoon) ---
            // Geocentric - works globally
            const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, now, true);
            const distAU = Math.sqrt(moonVec.x ** 2 + moonVec.y ** 2 + moonVec.z ** 2);
            const distKm = distAU * 149597870.7;

            // Check for ACTIVE status (happening right now)
            // This overrides everything else because diff = 0
            if (distKm < 360000) {
                minTimeDiff = 0;
                bestEvent = {
                    name: 'PERIGEE SYZYGY (SUPERMOON)',
                    type: 'SUPERMOON',
                    date: now,
                    formattedDate: 'CURRENTLY VISIBLE',
                    timeUntil: 'NOW',
                    badge: 'SUPERMOON'
                };
            } else if (distKm > 405000) {
                minTimeDiff = 0;
                bestEvent = {
                    name: 'APOGEE SYZYGY (MICROMOON)',
                    type: 'MICROMOON',
                    date: now,
                    formattedDate: 'CURRENTLY VISIBLE',
                    timeUntil: 'NOW',
                    badge: 'MICROMOON'
                };
            }

            // Finalize Time String
            if (bestEvent && bestEvent.timeUntil !== 'NOW') {
                const diffSeconds = Math.floor((bestEvent.date.getTime() - now.getTime()) / 1000);
                const days = Math.floor(diffSeconds / 86400);
                bestEvent.timeUntil = `${days} DAYS`;
            }

            setEvent(bestEvent);
        };

        // [OPTIMIZATION] Defer heavy calculation to next tick to avoid blocking UI
        const timer = setTimeout(calculate, 0);

        return () => clearTimeout(timer);
    }, [lat, lon]);

    return event;
}
