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

    // Helper to format coords
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
            className="flex md:flex-col flex-row justify-between md:justify-center items-center md:items-stretch gap-4 md:gap-8 w-full md:w-64 p-4 md:p-6 border-t md:border-t-0 md:border-r border-celestium-dim/20 bg-celestium-bg/50 backdrop-blur-sm order-2 md:order-1"
        >
            {/* ... (Constellation Section unchanged) ... */}
            <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-[0.2em] text-celestium-accent opacity-50 border-b border-celestium-accent/20 pb-2 mb-2">
                    Cosmic Sector
                </h3>
                <div className="text-2xl text-white font-bold tracking-widest glow-text">
                    {constellation}
                </div>
                <div className="text-xs text-celestium-dim uppercase tracking-widest">
                    {season}
                </div>
            </div>

            {/* GEOLOCATION DATA */}
            <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-[0.2em] text-celestium-accent opacity-50 border-b border-celestium-accent/20 pb-2 mb-2">
                    Observation Deck
                </h3>

                {/* MODE TOGGLE */}
                <div className="flex items-center justify-between text-xs tracking-wider mb-2">
                    <span className="text-celestium-dim">PROTOCOL:</span>
                    <button
                        onClick={onToggleMode}
                        className={`px-3 py-2 md:py-1 rounded border transition-all ${mode === 'TRUE_SOLAR'
                            ? 'border-celestium-accent text-celestium-accent shadow-[0_0_8px_rgba(0,255,157,0.3)]'
                            : 'border-celestium-dim text-celestium-dim'
                            }`}
                    >
                        {mode === 'TRUE_SOLAR' ? 'SOLAR' : 'ISO'}
                    </button>
                </div>

                {/* COORDS */}
                <div className="flex flex-col gap-1 font-mono text-xs text-celestium-text/80">
                    <div className="flex justify-between">
                        <span className="text-celestium-dim">LAT:</span>
                        <span>{fmt(geo.latitude)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-celestium-dim">LON:</span>
                        <span>{fmt(geo.longitude)}</span>
                    </div>
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
                                className="w-full bg-black/50 border border-celestium-dim text-celestium-accent text-base md:text-xs p-1 outline-none focus:border-celestium-accent"
                            />
                            <input
                                type="number"
                                placeholder="LONGITUDE"
                                value={manualLon}
                                onChange={(e) => setManualLon(e.target.value)}
                                className="w-full bg-black/50 border border-celestium-dim text-celestium-accent text-base md:text-xs p-1 outline-none focus:border-celestium-accent"
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
            </div >
        </motion.div >
    );
}
