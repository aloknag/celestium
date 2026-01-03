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
    const dayRadius = 180;
    const moonRadius = 40;

    // Solar Arc Progress (0-1)
    const yearProgress = solarArc ? (solarArc / 360) : 1;
    const yearCircumference = 2 * Math.PI * yearRadius;
    const yearDashOffset = yearCircumference * (1 - yearProgress);

    // Rotation Progress (0-1)

    // We want the ring to ACTUALLY rotate, not just fill?
    // User spec: "Inner Ring: Rotating. Represents the Day."
    // So we rotate the entire group.

    // Moon Logic
    // 0 -> New (Dark), 15 -> Full (Light)
    // Distance from 15: |15 - phase| -> 0 means Full. 15 means New.
    const moonDarkness = Math.abs(15 - lunarPhase) / 15; // 0.0 (Bright) to 1.0 (Dark)
    const moonOpacity = 1 - moonDarkness; // 1.0 (Full) to 0.0 (New)

    return (
        <div className={`relative flex items-center justify-center w-[${size}px] h-[${size}px] opacity-90`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* YEAR RING (Outer) */}
                {/* Track */}
                <circle
                    cx={center} cy={center} r={yearRadius}
                    stroke={isNull ? "#330000" : "#1a1a1a"} strokeWidth="2" fill="none"
                />
                {/* Progress */}
                <motion.circle
                    cx={center} cy={center} r={yearRadius}
                    stroke={isNull ? "#ff3333" : "#e0e0e0"}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={yearCircumference}
                    initial={{ strokeDashoffset: yearCircumference }}
                    animate={{
                        strokeDashoffset: isNull ? [yearCircumference, 0, yearCircumference] : yearDashOffset,
                        stroke: isNull ? ["#ff3333", "#550000", "#ff3333"] : "#e0e0e0"
                    }}
                    transition={isNull ? { duration: 2, repeat: Infinity } : { duration: 1 }}
                    strokeLinecap="round"
                    style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                />

                {/* DAY RING (Inner) - Spins in real time */}
                <motion.g
                    style={{ originX: "50%", originY: "50%" }}
                    animate={{ rotate: rotation }}
                    transition={{ type: "tween", ease: "linear", duration: 0 }} // Instant update tied to frame
                >
                    <circle
                        cx={center} cy={center} r={dayRadius}
                        stroke="#333" strokeWidth="1" fill="none"
                        strokeDasharray="4 4"
                    />
                    <circle
                        cx={center} cy={center - dayRadius} r="5" fill="#00ff9d"
                    />
                    {/* Day Marker Line */}
                    <line x1={center} y1={center} x2={center} y2={center - dayRadius} stroke="rgba(0, 255, 157, 0.2)" />
                </motion.g>

                {/* MOON (Center) */}
                <circle cx={center} cy={center} r={moonRadius + 5} stroke="#333" strokeWidth="1" fill="none" />
                <motion.circle
                    cx={center} cy={center} r={moonRadius}
                    fill="#e0e0e0"
                    initial={false}
                    animate={{ opacity: 0.2 + (moonOpacity * 0.8) }}
                />
                <text
                    x={center} y={center}
                    dominantBaseline="middle" textAnchor="middle"
                    fill="#000" fontSize="12"
                    className="font-mono"
                >
                    {lunarPhase}
                </text>
            </svg>

            {/* Null Interval Overlay Text inside ring */}
            {isNull && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-red-500 font-bold text-xl tracking-[0.2em] animate-pulse">
                        NULL INTERVAL
                    </div>
                </div>
            )}
        </div>
    );
};
