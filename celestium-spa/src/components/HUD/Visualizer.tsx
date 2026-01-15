import { motion } from 'framer-motion';
import type { FC } from 'react';
import { CONSTELLATIONS } from '../../hooks/useConstellation';
// [NEW] Import Store
import { useStore } from '../../store/store';

interface VisualizerProps {
    solarArc: number | null; // 0-360
    rotation: number; // 0-360
    lunarPhase: number; // 0-29
    isNull: boolean;
}

export const Visualizer: FC<VisualizerProps> = ({ solarArc, rotation, lunarPhase, isNull }) => {
    // [NEW] Get Focus State
    const { focusedSector } = useStore();

    // [NEW] Helper for Opacity Logic
    const getOpacity = (group: 'RING' | 'MOON' | 'DAY') => {
        if (!focusedSector) return 1;
        switch (group) {
            case 'RING': return (focusedSector === 'ARC' || focusedSector === 'AEON') ? 1 : 0.4;
            case 'MOON': return focusedSector === 'PHASE' ? 1 : 0.4;
            case 'DAY': return focusedSector === 'ROTATION' ? 1 : 0.4;
        }
    };

    // Conversions for SVG
    const size = 600;
    const center = size / 2;

    // Helper: Polar to Cartesian
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    // Rings
    const constellRadius = 240; // Reduced from 260 to prevent cropping
    const yearRadius = 210;     // Reduced to maintain gap
    const tickRadius = 180;
    const dayRadius = 140;
    const moonRadius = 35;

    // Solar Arc Progress
    const safeArc = Number.isFinite(solarArc as number) ? (solarArc as number) : 0;
    const safeRotation = Number.isFinite(rotation) ? rotation : 0;
    const safeLunarPhase = Number.isFinite(lunarPhase) ? lunarPhase : 0;

    const angularDistance = (a: number, b: number) => {
        // Smallest distance between angles a and b in degrees (0..180)
        const d = ((a - b + 540) % 360) - 180;
        return Math.abs(d);
    };

    const seasonalMarkers: Array<{ angle: number; label: string; title: string }> = [
        { angle: 0, label: 'VE', title: 'Vernal Equinox (Solar Arc 000°)' },
        { angle: 90, label: 'SS', title: 'Summer Solstice (Solar Arc 090°)' },
        { angle: 180, label: 'AE', title: 'Autumnal Equinox (Solar Arc 180°)' },
        { angle: 270, label: 'WS', title: 'Winter Solstice (Solar Arc 270°)' },
    ];

    const moonPhaseHint = (() => {
        // Key lunar phase hints on the 0–29 index
        if (safeLunarPhase === 0 || safeLunarPhase === 29) return { label: 'NEW', title: 'New Moon (Phase 00)' };
        if (safeLunarPhase === 7) return { label: '1Q', title: 'First Quarter (Phase 07)' };
        if (safeLunarPhase === 15) return { label: 'FULL', title: 'Full Moon (Phase 15)' };
        if (safeLunarPhase === 22) return { label: '3Q', title: 'Last Quarter (Phase 22)' };
        return null;
    })();
    const yearProgress = safeArc / 360;
    const yearCircumference = 2 * Math.PI * yearRadius;
    const yearDashOffset = yearCircumference * (1 - yearProgress);

    // 1. CONSTELLATION GENERATOR
    const constellationsRender = CONSTELLATIONS.map((c, i) => {
        if (i === CONSTELLATIONS.length - 1) return null; // Skip duplicate Pisces end

        const nextStart = CONSTELLATIONS[i + 1].start;
        // Handle wrap-around for Pisces (351 -> 29)
        const end = (i === 0) ? 29 + 360 : (nextStart < c.start ? nextStart + 360 : nextStart);
        const start = (i === 0) ? 351 : c.start;

        // Label Position (Midpoint)
        const midAngle = start + (end - start) / 2;
        const rad = (midAngle - 90) * (Math.PI / 180);
        const x = center + Math.cos(rad) * constellRadius;
        const y = center + Math.sin(rad) * constellRadius;

        // Separator Line (Start Angle)
        const lineRad = (start - 90) * (Math.PI / 180);
        const lx1 = center + Math.cos(lineRad) * (yearRadius + 15);
        const ly1 = center + Math.sin(lineRad) * (yearRadius + 15);
        const lx2 = center + Math.cos(lineRad) * (constellRadius - 10);
        const ly2 = center + Math.sin(lineRad) * (constellRadius - 10);

        // Highlight Active Sector
        // Pisces logic: if arc >= 351 OR arc < 29
        const isPiscesLoop = c.name === "PISCES";
        const isActive = isPiscesLoop
            ? (safeArc >= 351 || safeArc < 29)
            : (safeArc >= start && safeArc < end);

        return (
            <g key={c.name}>
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={isActive ? "#FFB800" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
                <text
                    x={x} y={y}
                    fill={isActive ? "#fff" : "rgba(255,255,255,0.2)"}
                    fontSize="10"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontFamily="monospace"
                    style={{
                        textShadow: isActive ? "0 0 10px white" : "none",
                        fontWeight: isActive ? "bold" : "normal"
                    }}
                >
                    {c.abbr || c.name.substring(0, 3)}
                </text>
            </g>
        );
    });

    // Ticks
    const ticks = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) - 90;
        const rad = angle * (Math.PI / 180);
        const x1 = center + Math.cos(rad) * tickRadius;
        const y1 = center + Math.sin(rad) * tickRadius;
        const x2 = center + Math.cos(rad) * (tickRadius - 10);
        const y2 = center + Math.sin(rad) * (tickRadius - 10);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />;
    });

    // MOON LOGIC (The Spotlight Method)
    // We move a "Light" circle across the face of the moon.
    // Phase 15 (Full) = Light Centered (0 offset)
    // Phase 0 (New) = Light Far Left (-60 offset)
    // Phase 29 (New) = Light Far Right (+60 offset)
    const lightOffset = (safeLunarPhase - 15) * 4;

    return (
        <div className="relative flex items-center justify-center w-full max-w-[600px] aspect-square">
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    {/* Solar Gradient: Gold for the Sun Path */}
                    <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(90)">
                        <stop offset="0%" stopColor="#FFB800" stopOpacity="1" />
                        <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
                    </linearGradient>

                    {/* MOON MASK (The Spotlight) */}
                    <mask id="moonLightMask">
                        {/* 1. Start with total darkness (Black Rect) */}
                        <rect x="0" y="0" width={size} height={size} fill="black" />

                        {/* 2. Add the Light Source (White Circle) */}
                        {/* It moves left/right based on phase */}
                        <circle
                            cx={center + lightOffset}
                            cy={center}
                            r={moonRadius}
                            fill="white"
                            filter="blur(4px)" /* Soften the terminator line */
                        />

                        {/* 3. Ensure the light stays within the Moon's circular boundary */}
                        {/* Actually, we just mask the base moon circle with this. */}
                    </mask>
                </defs>

                {/* --- GROUP 1: SOLAR ARC (Constellations + Year Ring) --- */}
                <g style={{ opacity: getOpacity('RING'), transition: 'opacity 0.4s ease-out' }}>
                    {/* 1. CONSTELLATION RING */}
                    <g>{constellationsRender}</g>

                    {/* YEAR RING (Background Track) */}
                    <circle cx={center} cy={center} r={yearRadius} stroke={isNull ? "rgba(255, 51, 51, 0.2)" : "rgba(255, 255, 255, 0.15)"} strokeWidth="2" fill="none" />

                    {/* SEASONAL MARKERS (Equinox/Solstice Hints) */}
                    <g>
                        {seasonalMarkers.map((m) => {
                            const isActive = !isNull && angularDistance(safeArc, m.angle) < 1;
                            const lineRad = (m.angle - 90) * (Math.PI / 180);
                            const r1 = yearRadius - 2;
                            const r2 = yearRadius + 12;
                            const x1 = center + Math.cos(lineRad) * r1;
                            const y1 = center + Math.sin(lineRad) * r1;
                            const x2 = center + Math.cos(lineRad) * r2;
                            const y2 = center + Math.sin(lineRad) * r2;
                            const tx = center + Math.cos(lineRad) * (yearRadius + 24);
                            const ty = center + Math.sin(lineRad) * (yearRadius + 24);

                            return (
                                <g key={`seasonal-${m.angle}`}>
                                    <title>{m.title}</title>
                                    <line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={isActive ? '#FFB800' : 'rgba(255,255,255,0.18)'}
                                        strokeWidth={isActive ? 2 : 1}
                                    />
                                    <text
                                        x={tx}
                                        y={ty}
                                        fill={isActive ? '#fff' : 'rgba(255,255,255,0.35)'}
                                        fontSize="9"
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontFamily="monospace"
                                        style={{ textShadow: isActive ? '0 0 10px white' : 'none' }}
                                    >
                                        {m.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* The Solar Arc (Comet Tail) + Sun Marker */}
                    {!isNull && (
                        <>
                            <motion.circle
                                cx={center} cy={center} r={yearRadius}
                                stroke="url(#solarGradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={yearCircumference}
                                strokeDashoffset={yearDashOffset}
                                strokeLinecap="round"
                                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                                // Add a subtle glow filter to the line itself
                                filter="drop-shadow(0 0 4px rgba(0, 255, 157, 0.5))"
                            />
                            {/* THE SUN MARKER (The White Star) */}
                            {(() => {
                                // Calculate position manually to ensure correct orbital placement
                                // User wants it flipped 180 degrees from original (Right) -> Left side.
                                // solarArc 0 is naturally Right (3 o'clock). 
                                // safeArc (from props) maps correctly to this SVG system (0=Top? No, 0=Right relative to -90 shift).
                                // Actually, let's just use safeArc directly as verified by the DashOffset logic.
                                const pos = polarToCartesian(center, center, yearRadius, safeArc);
                                return (
                                    <motion.circle
                                        key={`sun-marker-${safeArc}`}
                                        cx={pos.x}
                                        cy={pos.y}
                                        r="4"
                                        fill="#FFB800"
                                        filter="drop-shadow(0 0 8px #FFB800)"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                    />
                                );
                            })()}
                        </>
                    )}

                    {/* Null Interval Pulse Ring */}
                    {isNull && (
                        <motion.circle
                            cx={center} cy={center} r={yearRadius}
                            stroke="#ff3333" strokeWidth="4" fill="none"
                            animate={{ opacity: [0.2, 1, 0.2], strokeWidth: [2, 6, 2] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            filter="drop-shadow(0 0 8px rgba(255, 51, 51, 0.8))"
                        />
                    )}
                </g>

                {/* STATIC TICKS */}
                <g>{ticks}</g>

                {/* --- GROUP 2: DAY (Rotating) --- */}
                <motion.g
                    style={{ originX: "50%", originY: "50%", opacity: getOpacity('DAY'), transition: 'opacity 0.4s ease-out' }}
                    animate={{ rotate: safeRotation }}
                    transition={{ type: "tween", ease: "linear", duration: 0 }}
                >
                    <circle
                        cx={center} cy={center} r={dayRadius}
                        stroke="rgba(0, 209, 255, 0.3)" strokeWidth="1" fill="none"
                        strokeDasharray="4 4"
                    />
                    {/* The "Sun" Indicator on the ring */}
                    <circle
                        cx={center} cy={center - dayRadius} r="4" fill="#fff"
                        filter="drop-shadow(0 0 4px #fff)"
                    />
                    <line x1={center} y1={center} x2={center} y2={center - dayRadius} stroke="rgba(255, 255, 255, 0.3)" />
                </motion.g>

                {/* --- GROUP 3: LUNAR (The Moon) --- */}
                <g style={{ opacity: getOpacity('MOON'), transition: 'opacity 0.4s ease-out' }}>
                    {/* 1. The Dark Side (Base) */}
                    <circle cx={center} cy={center} r={moonRadius} fill="#1a1a1a" />

                    {/* 2. The Light Side (Masked) */}
                    <circle
                        cx={center} cy={center} r={moonRadius}
                        fill="#E0E0E0"
                        mask="url(#moonLightMask)"
                    />

                    {/* 3. Inner shadow for depth (Crater effect) */}
                    <circle cx={center} cy={center} r={moonRadius} stroke="rgba(0,0,0,0.5)" strokeWidth="2" fill="none" />
                </g>

                {/* LUNAR PHASE HINT (New/Quarter/Full) */}
                {moonPhaseHint && (
                    <g>
                        <title>{moonPhaseHint.title}</title>
                        <text
                            x={center}
                            y={center + moonRadius + 20}
                            fill="#00D1FF"
                            fontSize="10"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontFamily="monospace"
                            style={{ textShadow: '0 0 10px rgba(0, 209, 255, 0.35)' }}
                        >
                            {moonPhaseHint.label}
                        </text>
                    </g>
                )}

            </svg>

            {isNull && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-red-500 font-bold text-xl tracking-[0.2em] animate-pulse bg-black/80 px-6 py-3 rounded border border-red-900 shadow-[0_0_30px_rgba(255,0,0,0.2)] backdrop-blur-sm">
                        NULL INTERVAL
                    </div>
                </div>
            )}
        </div>
    );
};
