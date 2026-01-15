import { useState, useEffect } from 'react';
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';

export interface CosmicEvent {
    type: 'ECLIPSE' | 'LUNAR' | 'PLANETARY';
    badge: 'SOLAR' | 'LUNAR' | 'PLANET' | 'SUPERMOON' | 'MICROMOON';
    name: string;
    date: Date;
    timeUntil: string;
    formattedDate: string;
}

export function useCosmicEvent(lat: number | null, lon: number | null) {
    const [event, setEvent] = useState<CosmicEvent | null>(null);

    useEffect(() => {
        const calculate = () => {
            const now = new Date();
            const candidates: CosmicEvent[] = [];
            const observer = (lat !== null && lon !== null) ? new Astronomy.Observer(lat, lon, 0) : null;

            // --- 1. INTELLIGENT ECLIPSE SCANNER ---
            // Look into the future for a VISIBLE eclipse.
            // We limit to 5 look-aheads to prevent performance hanging.

            // A. SOLAR SEARCH
            let searchDate = new Date(now.getTime());
            let foundSolar = false;
            let attempts = 0;

            while (!foundSolar && attempts < 5) {
                const globalSolar = Astronomy.SearchGlobalSolarEclipse(searchDate);
                const peak = globalSolar.peak.date;

                let isVisible = false;
                if (observer) {
                    // Check local visibility
                    // SearchLocalSolarEclipse looks for an event strictly near the given time
                    const searchStart = new Date(peak.getTime() - 86400000);
                    const localSolar = Astronomy.SearchLocalSolarEclipse(searchStart, observer);

                    // Verify it is the same event (approx same time)
                    if (localSolar && Math.abs(localSolar.peak.time.date.getTime() - peak.getTime()) < 86400000) {
                        isVisible = true;
                    }
                } else {
                    isVisible = true; // No geo? Assume global relevance.
                }

                if (isVisible) {
                    const kind = String(globalSolar.kind).replace('_', ' ').toUpperCase();
                    candidates.push(createEvent('ECLIPSE', 'SOLAR', `SOLAR ${kind}`, peak));
                    foundSolar = true;
                } else {
                    // Skip and look forward 10 days
                    searchDate = new Date(peak.getTime() + (10 * 86400000));
                    attempts++;
                }
            }

            // B. LUNAR SEARCH
            searchDate = new Date(now.getTime()); // Reset date
            let foundLunar = false;
            attempts = 0;

            while (!foundLunar && attempts < 5) {
                const globalLunar = Astronomy.SearchLunarEclipse(searchDate);
                const peak = globalLunar.peak.date;

                let isVisible = false;
                if (observer) {
                    // Check altitude > -0.5 deg (horizon dip)
                    const moonPos = Astronomy.Equator(Astronomy.Body.Moon, peak, observer, true, true);
                    const horizon = Astronomy.Horizon(peak, observer, moonPos.ra, moonPos.dec, 'normal');
                    if (horizon.altitude > -0.5) isVisible = true;
                } else {
                    isVisible = true;
                }

                if (isVisible) {
                    const isTotal = globalLunar.kind === Astronomy.EclipseKind.Total;
                    const name = isTotal ? "BLOOD MOON" : `LUNAR ${String(globalLunar.kind).toUpperCase()}`;
                    candidates.push(createEvent('ECLIPSE', 'LUNAR', name, peak));
                    foundLunar = true;
                } else {
                    searchDate = new Date(peak.getTime() + (10 * 86400000));
                    attempts++;
                }
            }

            // --- 2. MOON PHASE SCANNER (Supermoons) ---
            // Scan next 6 Full Moons (approx 6 months)
            let moonSearch = new Date(now.getTime());
            for (let i = 0; i < 6; i++) {
                const fullMoon = Astronomy.SearchMoonPhase(180, moonSearch, 40);
                if (!fullMoon) break;

                // Distance Check
                const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, fullMoon.date, true);
                const distKm = Math.sqrt(moonVec.x ** 2 + moonVec.y ** 2 + moonVec.z ** 2) * 149597870.7;

                if (distKm < 360000) {
                    candidates.push(createEvent('LUNAR', 'SUPERMOON', 'SUPERMOON', fullMoon.date));
                } else if (distKm > 405000) {
                    candidates.push(createEvent('LUNAR', 'MICROMOON', 'MICROMOON', fullMoon.date));
                }

                moonSearch = new Date(fullMoon.date.getTime() + (10 * 86400000));
            }

            // --- 3. PLANETARY SCANNER ---
            ['Jupiter', 'Saturn', 'Mars'].forEach(planetName => {
                // Search for Opposition (0 deg relative long) in next 365 days
                let body: Astronomy.Body;
                switch (planetName) {
                    case 'Jupiter': body = Astronomy.Body.Jupiter; break;
                    case 'Saturn': body = Astronomy.Body.Saturn; break;
                    case 'Mars': body = Astronomy.Body.Mars; break;
                    default: return;
                }

                const opp = Astronomy.SearchRelativeLongitude(body, 0, now);
                if (opp) {
                    candidates.push(createEvent('PLANETARY', 'PLANET', `${planetName.toUpperCase()} OPPOSITION`, opp.date));
                }
            });

            // --- 4. SORT & SELECT ---
            if (candidates.length > 0) {
                candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
                setEvent(candidates[0]); // Return the closest one
            }
        };

        calculate();
        const interval = setInterval(calculate, 3600000); // Hourly refresh
        return () => clearInterval(interval);

    }, [lat, lon]);

    return event;
}

function createEvent(type: 'ECLIPSE' | 'LUNAR' | 'PLANETARY', badge: 'SOLAR' | 'LUNAR' | 'PLANET' | 'SUPERMOON' | 'MICROMOON', name: string, date: Date): CosmicEvent {
    const dtTarget = DateTime.fromJSDate(date);
    const dtNow = DateTime.now();
    const diff = dtTarget.diff(dtNow, ['days', 'hours']);

    return {
        type,
        badge,
        name,
        date,
        timeUntil: `${Math.floor(diff.days)}d ${Math.floor(diff.hours)}h`,
        formattedDate: dtTarget.toFormat("yyyy.MM.dd")
    };
}
