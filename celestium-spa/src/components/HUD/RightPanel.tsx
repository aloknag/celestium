import { motion } from 'framer-motion';
import { useCosmicEvent } from '../../hooks/useCosmicEvent';

interface RightPanelProps {
    geo: {
        latitude: number | null;
        longitude: number | null;
    };
}

export function RightPanel({ geo }: RightPanelProps) {
    const nextEvent = useCosmicEvent(geo.latitude, geo.longitude);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="panel-glass flex flex-col justify-between gap-8 w-full md:w-64 order-3"
        >
            {/* --- INTELLIGENT EVENT TRACKER --- */}
            <div className="flex flex-col gap-2">
                <div className="border-b border-celestium-solar/20 pb-2 mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-celestium-solar font-sans text-[10px] tracking-widest">
                            NEXT VISIBLE EVENT
                        </span>

                        {/* DYNAMIC BADGE (Color Only) */}
                        {nextEvent && (
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] ${nextEvent.badge === 'SOLAR' ? 'bg-celestium-null' :
                                nextEvent.badge === 'SUPERMOON' ? 'bg-white' :
                                    nextEvent.badge === 'MICROMOON' ? 'bg-gray-500' :
                                        nextEvent.badge === 'PLANET' ? 'bg-blue-400' :
                                            'bg-celestium-accent'
                                }`} />
                        )}
                    </div>

                    {nextEvent ? (
                        <div className="flex flex-col gap-1 text-[10px] tracking-wider text-celestium-text font-mono">
                            <div className="text-white font-bold glow-text">
                                {nextEvent.name}
                            </div>

                            <div className="flex justify-between text-celestium-dim">
                                <span>T-MINUS:</span>
                                <span className="text-white">{nextEvent.timeUntil}</span>
                            </div>

                            <div className="flex justify-end gap-2 text-[9px] mt-1">
                                <span className="text-celestium-text/70">
                                    {nextEvent.formattedDate}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-[10px] text-celestium-dim animate-pulse">
                            SCANNING DEEP SPACE...
                        </div>
                    )}
                </div>
            </div>

            {/* --- LEGEND (Moved from LegendPanel) --- */}
            <div className="flex flex-col gap-2 w-full border-t border-celestium-dim/20 pt-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-celestium-solar font-sans opacity-80 border-b border-celestium-solar/30 pb-2 mb-2">
                    Legend
                </h3>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] md:text-xs tracking-widest">
                    <div className="flex items-baseline justify-between">
                        <span className="text-white font-bold">VE</span>
                        <span className="text-slate-300">Vernal Equinox</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-white font-bold">AE</span>
                        <span className="text-slate-300">Autumnal Equinox</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-white font-bold">SS</span>
                        <span className="text-slate-300">Summer Solstice</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-white font-bold">WS</span>
                        <span className="text-slate-300">Winter Solstice</span>
                    </div>
                </div>

                <div className="text-[9px] md:text-[10px] text-white/40 tracking-widest mt-2">
                    Used on the orbital ring markers.
                </div>
            </div>
        </motion.div>
    );
}
