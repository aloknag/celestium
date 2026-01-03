import { motion } from 'framer-motion';
import type { FC } from 'react';

interface VisualizerProps {
    solarArc: number | null; // 0-360
    rotation: number; // 0-360
    lunarPhase: number; // 0-29
    isNull: boolean;
}

export const Visualizer: FC<VisualizerProps> = ({ solarArc, rotation, lunarPhase, isNull }) => {
    // Conversions for SVG
    const size = 600;
    const center = size / 2;

    // Rings
    const yearRadius = 250;
    const tickRadius = 220;
    const dayRadius = 180;
    const moonRadius = 40;

    // Solar Arc Progress
    const yearProgress = solarArc ? (solarArc / 360) : 1;
    const yearCircumference = 2 * Math.PI * yearRadius;
    const yearDashOffset = yearCircumference * (1 - yearProgress);

    // Ticks
    const ticks = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) - 90;
        const rad = angle * (Math.PI / 180);
        const x1 = center + Math.cos(rad) * tickRadius;
        const y1 = center + Math.sin(rad) * tickRadius;
        const x2 = center + Math.cos(rad) * (tickRadius - 10);
        const y2 = center + Math.sin(rad) * (tickRadius - 10);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />;
    });

    // MOON LOGIC (The Spotlight Method)
    // We move a "Light" circle across the face of the moon.
    // Phase 15 (Full) = Light Centered (0 offset)
    // Phase 0 (New) = Light Far Left (-60 offset)
    // Phase 29 (New) = Light Far Right (+60 offset)
    const lightOffset = (lunarPhase - 15) * 4;

    return (
        <div className={`relative flex items-center justify-center w-[${size}px] h-[${size}px]`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    {/* Solar Gradient: Neon Green to Transparent */}
                    <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(90)">
                        <stop offset="0%" stopColor="#00ff9d" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00ff9d" stopOpacity="0" />
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

                {/* YEAR RING (Background Track) */}
                <circle cx={center} cy={center} r={yearRadius} stroke={isNull ? "rgba(255, 51, 51, 0.2)" : "rgba(255, 255, 255, 0.05)"} strokeWidth="2" fill="none" />

                {/* The Solar Arc (Comet Tail) */}
                {!isNull && (
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

                {/* STATIC TICKS */}
                <g>{ticks}</g>

                {/* DAY RING (Rotating) */}
                <motion.g
                    style={{ originX: "50%", originY: "50%" }}
                    animate={{ rotate: rotation }}
                    transition={{ type: "tween", ease: "linear", duration: 0 }}
                >
                    <circle
                        cx={center} cy={center} r={dayRadius}
                        stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" fill="none"
                        strokeDasharray="4 4"
                    />
                    {/* The "Sun" Indicator on the ring */}
                    <circle
                        cx={center} cy={center - dayRadius} r="4" fill="#fff"
                        filter="drop-shadow(0 0 4px #fff)"
                    />
                    <line x1={center} y1={center} x2={center} y2={center - dayRadius} stroke="rgba(255, 255, 255, 0.1)" />
                </motion.g>

                {/* --- THE MOON --- */}

                {/* 1. The Dark Side (Base) */}
                <circle cx={center} cy={center} r={moonRadius} fill="#1a1a1a" />

                {/* 2. The Light Side (Masked) */}
                <circle
                    cx={center} cy={center} r={moonRadius}
                    fill="#e0e0e0"
                    mask="url(#moonLightMask)"
                />

                {/* 3. Inner shadow for depth (Crater effect) */}
                <circle cx={center} cy={center} r={moonRadius} stroke="rgba(0,0,0,0.5)" strokeWidth="2" fill="none" />

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
