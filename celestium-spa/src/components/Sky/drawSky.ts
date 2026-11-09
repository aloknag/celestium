import { constellationAtLongitude, constellationSectors, screenAngle, terminatorX } from '../../lib/sky';
import type { SkyState } from '../../lib/sky';
import type { Starfield } from '../../lib/starfield';

// Imperative Canvas 2D renderer for the Living Sky. No React, no timers: the
// caller owns the clock and the canvas transform (CSS px, DPR already applied).
// Earth-fixed frame: the local meridian is the top of the screen, so "you" sits
// at the top and the wheel (stars, ecliptic ring, Sun, Moon) turns past it.

export interface SkyFrame {
    sky: SkyState;
    meridianLon: number;   // ecliptic longitude at the top of the screen
    showYou: boolean;      // false while the daily wheel is pinned (MONTH / YEAR)
    twinkleT: number;      // seconds; 0 freezes the twinkle (reduced motion)
    starfield: Starfield;  // already trimmed to starCount(w, h)
    cy: number;            // dial centre y, CSS px (x is always w / 2); from dialLayout
    rz: number;            // ecliptic ring radius, CSS px; from dialLayout
}

const TAU = Math.PI * 2;
const SECTORS = constellationSectors();
const MONO = '"SFMono-Regular", "JetBrains Mono", Menlo, Consolas, monospace';

// Polar → screen. angle 0 = up, increasing clockwise.
function pt(cx: number, cy: number, radius: number, deg: number) {
    const a = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.sin(a), y: cy - radius * Math.cos(a) };
}

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string,
               color: string, size: number, weight: string) {
    ctx.font = `${weight} ${size}px ${MONO}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

// A body whose lit side faces (sunX, sunY). The lit region is the Sun-side
// half-disc bounded by a half-ellipse terminator with x semi-axis
// terminatorX(elong, r), so its area equals the illuminated fraction
// (elong 90 = straight terminator, used for Earth).
function drawLit(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, elong: number,
                 sunX: number, sunY: number, lit: string, dark: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(sunY - y, sunX - x)); // +x now points at the Sun
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
    ctx.fillStyle = dark; ctx.fill();

    const a = terminatorX(elong, r);
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false); // limb on the Sun side
    ctx.ellipse(0, 0, Math.max(Math.abs(a), 1e-4), r, 0, Math.PI / 2, -Math.PI / 2, a > 0); // terminator back to the top
    ctx.closePath();
    ctx.fillStyle = lit; ctx.fill();

    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.restore();
}

export function drawSky(ctx: CanvasRenderingContext2D, view: { w: number; h: number }, frame: SkyFrame): void {
    const { w, h } = view;
    const { sky, meridianLon, showYou, twinkleT, starfield, cy, rz } = frame;
    const cx = w / 2;
    const rSky = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)); // reach the farthest corner
    const ang = (lon: number) => screenAngle(lon, meridianLon);

    // ---- background ----
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rSky);
    g.addColorStop(0, '#0c1124');
    g.addColorStop(0.55, '#080c1b');
    g.addColorStop(1, '#04060e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // ---- Milky-Way haze (fixed to the celestial sphere) ----
    for (const s of starfield.haze) {
        const p = pt(cx, cy, s.rad * rSky + s.off, ang(s.lon));
        const o = s.base * (0.7 + 0.3 * Math.sin(twinkleT * s.sp + s.ph));
        ctx.beginPath(); ctx.arc(p.x, p.y, s.r, 0, TAU);
        ctx.fillStyle = `rgba(170,185,235,${o})`; ctx.fill();
    }

    // ---- stars ----
    for (const s of starfield.stars) {
        const p = pt(cx, cy, s.rad * rSky, ang(s.lon));
        const o = Math.max(0, s.base + s.amp * Math.sin(twinkleT * s.sp + s.ph));
        ctx.beginPath(); ctx.arc(p.x, p.y, s.r, 0, TAU);
        ctx.fillStyle = s.warm ? `rgba(255,224,198,${o})` : `rgba(234,240,255,${o})`;
        ctx.fill();
        if (s.r > 1.25) {
            ctx.beginPath(); ctx.arc(p.x, p.y, s.r * 2.6, 0, TAU);
            ctx.fillStyle = `rgba(234,240,255,${o * 0.1})`; ctx.fill();
        }
    }

    // ---- ecliptic ring: 13 IAU sectors ----
    ctx.beginPath(); ctx.arc(cx, cy, rz, 0, TAU);
    ctx.strokeStyle = 'rgba(190,205,255,0.10)'; ctx.lineWidth = 1; ctx.stroke();

    const sunName = constellationAtLongitude(sky.sunLon);
    const upName = constellationAtLongitude(meridianLon);
    const compact = w < 560; // full names clip at the horizontal extremes on phones
    for (const s of SECTORS) {
        const t1 = pt(cx, cy, rz - 7, ang(s.start)), t2 = pt(cx, cy, rz + 7, ang(s.start));
        ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y);
        ctx.strokeStyle = 'rgba(190,205,255,0.10)'; ctx.lineWidth = 1; ctx.stroke();

        const isSun = s.name === sunName;
        const isUp = showYou && s.name === upName; // "overhead" is a daily-wheel notion
        const lp = pt(cx, cy, rz + 22, ang(s.mid));
        label(ctx, lp.x, lp.y, compact ? s.abbr : s.name,
            isSun ? 'rgba(255,206,138,0.95)' : isUp ? 'rgba(223,230,245,0.85)' : 'rgba(150,160,189,0.40)',
            isSun || isUp ? 11 : 9.5, isSun ? '700' : '400');
    }

    // ---- Sun on the ecliptic ----
    const sp = pt(cx, cy, rz, ang(sky.sunLon));
    const glow = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 46);
    glow.addColorStop(0, 'rgba(255,206,138,0.9)');
    glow.addColorStop(0.4, 'rgba(255,170,90,0.28)');
    glow.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 46, 0, TAU);
    ctx.fillStyle = glow; ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 11, 0, TAU);
    ctx.fillStyle = '#ffce8a'; ctx.fill();

    // faint Earth–Sun line
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sp.x, sp.y);
    ctx.strokeStyle = 'rgba(255,206,138,0.12)'; ctx.lineWidth = 1; ctx.stroke();

    // ---- Moon on its orbit, lit side toward the Sun ----
    const rm = rz * 0.52;
    ctx.beginPath(); ctx.arc(cx, cy, rm, 0, TAU);
    ctx.strokeStyle = 'rgba(190,205,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
    const mp = pt(cx, cy, rm, ang(sky.moonLon));
    drawLit(ctx, mp.x, mp.y, 12, sky.elong, sp.x, sp.y, '#e8ecf5', '#20232f');

    // ---- Earth at the centre, terminator facing the Sun ----
    drawLit(ctx, cx, cy, 16, 90, sp.x, sp.y, '#5b7fd6', '#1a2440');

    // "you are here": fixed on Earth's rim at the local meridian (top)
    if (showYou) {
        const yp = pt(cx, cy, 16, 0);
        ctx.beginPath(); ctx.arc(yp.x, yp.y, 2.4, 0, TAU);
        ctx.fillStyle = '#fff'; ctx.fill();
    }
}
