import { useEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { drawSky } from './drawSky';
import type { SkyFrame } from './drawSky';
import { dayFraction, meridianLongitude, skyAt } from '../../lib/sky';
import type { SkySnapshot } from '../../lib/sky';
import { FROZEN_MODES, stepModelTime } from '../../lib/skyClock';
import type { SkyMode } from '../../lib/skyClock';
import { buildStarfield, starCount } from '../../lib/starfield';
import type { Starfield } from '../../lib/starfield';

interface SkySceneProps {
    mode: SkyMode;
    reduced: boolean;
    onSnapshot: (s: SkySnapshot) => void;
}

const SEED = 1;
const MAX_VIEW = { w: 2560, h: 1440 }; // the field is generated once at this size, then trimmed
const SNAPSHOT_MS = 125;               // overlay refresh, ~8 Hz
const BLEND_S = 0.6;                   // wheel eases back to live after a frozen mode

const norm360 = (x: number) => ((x % 360) + 360) % 360;
const arc = (a: number, b: number) => ((b - a + 540) % 360) - 180; // signed shortest arc a→b
const smooth = (t: number) => t * t * (3 - 2 * t);

// Owns the canvas, its sizing, the model clock and the single rAF loop. The loop
// never touches React state: the overlay gets a throttled snapshot instead.
export function SkyScene({ mode, reduced, onSnapshot }: SkySceneProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modeRef = useRef(mode);
    const reducedRef = useRef(reduced);
    const snapRef = useRef(onSnapshot);
    const fullField = useMemo(() => buildStarfield(SEED, starCount(MAX_VIEW.w, MAX_VIEW.h)), []);

    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { reducedRef.current = reduced; }, [reduced]);
    useEffect(() => { snapRef.current = onSnapshot; }, [onSnapshot]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let w = 1, h = 1;
        let field: Starfield = { stars: [], haze: [] };
        let lastDraw: Omit<SkyFrame, 'starfield'> | null = null; // lets a resize repaint at once
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = Math.max(1, Math.round(rect.width));
            h = Math.max(1, Math.round(rect.height));
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // prefix of the same field: a resize never re-rolls the stars
            const n = starCount(w, h);
            field = { stars: fullField.stars.slice(0, n), haze: fullField.haze.slice(0, Math.round(n * 0.7)) };
            // Resizing the bitmap clears it, and the next rAF runs after this frame is painted:
            // repaint now, or every resize (window drag, mobile address bar) flashes a blank frame.
            if (lastDraw) drawSky(ctx, { w, h }, { ...lastDraw, starfield: field });
        };
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        resize();

        let raf = 0;
        let last = performance.now();
        let modelMs = Date.now();
        let lastSnap = -Infinity;
        let wasFrozen = false;
        let pinned = { dayFrac: 0, meridianLon: 0 }; // wheel + clock while MONTH / YEAR
        let shown = { dayFrac: 0, meridianLon: 0 };  // what the previous frame displayed
        let blend = BLEND_S;                         // seconds into the ease back to live (BLEND_S = done)
        let blendFrom = 0;

        const frame = (ts: number) => {
            const dtMs = ts - last;
            last = ts;
            const m = modeRef.current;
            modelMs = stepModelTime(modelMs, dtMs, m, Date.now());
            const date = new Date(modelMs);
            const sky = skyAt(date);
            const liveDay = dayFraction(date);
            const liveMeridian = meridianLongitude(sky.sunLon, liveDay);
            const frozen = FROZEN_MODES.has(m);

            if (frozen && !wasFrozen) pinned = { ...shown }; // hold the wheel where it was
            if (!frozen && wasFrozen) { blend = 0; blendFrom = pinned.meridianLon; }
            wasFrozen = frozen;

            let dayFrac: number;
            let meridianLon: number;
            if (frozen) {
                ({ dayFrac, meridianLon } = pinned);
            } else {
                dayFrac = liveDay;
                if (blend < BLEND_S) {
                    blend = Math.min(BLEND_S, blend + Math.min(dtMs, 100) / 1000);
                    meridianLon = norm360(blendFrom + arc(blendFrom, liveMeridian) * smooth(blend / BLEND_S));
                } else {
                    meridianLon = liveMeridian;
                }
            }
            shown = { dayFrac, meridianLon };

            lastDraw = {
                sky,
                meridianLon,
                showYou: !frozen,
                twinkleT: reducedRef.current ? 0 : ts / 1000,
            };
            drawSky(ctx, { w, h }, { ...lastDraw, starfield: field });

            if (ts - lastSnap >= SNAPSHOT_MS) {
                lastSnap = ts;
                snapRef.current({ date, dayFrac, sky, meridianLon, frozen });
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [fullField]);

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label="Live model of the sky: Earth at the centre, the Sun and Moon orbiting it, the constellations wheeling past"
            className="absolute inset-0 h-full w-full"
        />
    );
}
