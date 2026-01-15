import { motion } from 'framer-motion';
import { useState } from 'react';

interface SidePanelProps {
    constellation: string;
    season: string;
    mode: 'STANDARD' | 'TRUE_SOLAR';
    geo: {
        latitude: number | null;
        longitude: number | null;
        loading: boolean;
        error: string | null;
    };
    onRequestLocation: () => void;
    onToggleMode: () => void;
    onManualLocation: (lat: number, lon: number) => void;
}

export function SidePanel({ constellation, season, mode, geo, onRequestLocation, onToggleMode, onManualLocation }: SidePanelProps) {
    const fmt = (n: number | null) => (n !== null) ? n.toFixed(4) : "---.----";
    const [isManual, setIsManual] = useState(false);
    const [manualLat, setManualLat] = useState("");
    const [manualLon, setManualLon] = useState("");

    const handleManualSubmit = () => {
        const lat = parseFloat(manualLat);
        const lon = parseFloat(manualLon);
        if (!isNaN(lat) && !isNaN(lon)) {
            onManualLocation(lat, lon);
            setIsManual(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="panel-glass flex flex-col justify-center items-stretch gap-6 md:gap-8 w-full md:w-64 order-2 md:order-1"
        >
            {/* --- COSMIC SECTOR --- */}
            <div className="flex flex-col gap-2">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-celestium-solar font-sans opacity-80 border-b border-celestium-solar/30 pb-2 mb-2">
                    Cosmic Sector
                </h3>
                <div className="text-2xl text-white font-bold tracking-widest glow-text">
                    {constellation}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">
                    {season}
                </div>
            </div>

            {/* --- OBSERVATION DECK (Restored) --- */}
            <div className="flex flex-col gap-2">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-celestium-solar font-sans opacity-80 border-b border-celestium-solar/30 pb-2 mb-2">
                    Observation Deck
                </h3>

                {/* MODE TOGGLE */}
                <div className="flex items-center justify-between text-xs tracking-wider mb-2">
                    <span className="text-slate-400 text-[10px]">PROTOCOL:</span>
                    <button
                        onClick={onToggleMode}
                        className={`px-3 py-2 md:py-1 rounded border transition-all ${mode === 'TRUE_SOLAR'
                            ? 'border-celestium-observer text-celestium-observer shadow-[0_0_8px_rgba(0,209,255,0.3)]'
                            : 'border-celestium-dim text-celestium-dim'
                            }`}
                    >
                        {mode === 'TRUE_SOLAR' ? 'SOLAR' : 'ISO'}
                    </button>
                </div>

                {/* COORDS */}
                <div className="flex flex-col gap-1 font-mono text-xs">
                    <div className="flex justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-white/50">LAT:</span>
                        <span className={`${mode === 'STANDARD' ? 'text-white/20' : (geo.latitude !== null ? 'text-celestium-observer' : 'text-white/20')} font-mono`}>
                            {fmt(geo.latitude)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-white/50">LON:</span>
                        <span className={`${mode === 'STANDARD' ? 'text-white/20' : (geo.longitude !== null ? 'text-celestium-observer' : 'text-white/20')} font-mono`}>
                            {fmt(geo.longitude)}
                        </span>
                    </div>

                    {mode === 'STANDARD' && (
                        <div className="text-[9px] text-center tracking-[0.2em] mt-2 text-white/30">
                            AWAITING LOCAL CALIBRATION
                        </div>
                    )}
                </div>

                {/* STATUS / ACTION */}
                <div className="mt-4">
                    {mode === 'STANDARD' ? (
                        <button
                            onClick={() => {
                                onToggleMode();
                            }}
                            className="w-full py-3 md:py-2 border border-celestium-dim text-celestium-dim text-[10px] tracking-widest hover:border-white hover:text-white transition-colors uppercase"
                        >
                            Sync Local Vector
                        </button>
                    ) : isManual ? (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input
                                type="number"
                                placeholder="LATITUDE"
                                value={manualLat}
                                onChange={(e) => setManualLat(e.target.value)}
                                className="w-full bg-black/50 border border-celestium-dim text-celestium-observer text-base md:text-xs p-1 outline-none focus:border-celestium-observer"
                            />
                            <input
                                type="number"
                                placeholder="LONGITUDE"
                                value={manualLon}
                                onChange={(e) => setManualLon(e.target.value)}
                                className="w-full bg-black/50 border border-celestium-dim text-celestium-observer text-base md:text-xs p-1 outline-none focus:border-celestium-observer"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsManual(false)}
                                    className="flex-1 py-1 border border-celestium-dim text-celestium-dim text-[10px] hover:bg-white/10"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleManualSubmit}
                                    className="flex-1 py-1 bg-celestium-accent/20 border border-celestium-accent text-celestium-accent text-[10px] hover:bg-celestium-accent/30"
                                >
                                    CONFIRM
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className={`text-[10px] text-center tracking-widest ${geo.loading ? "text-celestium-accent animate-pulse" : (geo.latitude !== null) ? "text-celestium-accent" : geo.error ? "text-celestium-null" : "text-celestium-dim"}`}>
                                {geo.loading ? "TRIANGULATING..." : (geo.latitude !== null) ? "SIGNAL LOCKED" : geo.error ? "SIGNAL LOST" : "WAITING FOR SIGNAL"}
                            </div>
                            {geo.error && (
                                <div className="text-[9px] text-red-500 text-center border border-red-900/50 p-1">
                                    ERR: {geo.error}
                                </div>
                            )}
                            <button
                                onClick={onRequestLocation}
                                className="w-full py-3 md:py-2 border border-celestium-accent/30 text-celestium-accent/70 text-[10px] tracking-widest hover:bg-celestium-accent/10 transition-colors uppercase"
                            >
                                Recalibrate
                            </button>
                            <button
                                onClick={() => setIsManual(true)}
                                className="w-full py-3 md:py-2 border border-celestium-dim/30 text-celestium-dim/70 text-[10px] tracking-widest hover:text-white transition-colors uppercase"
                            >
                                Manual Override
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
