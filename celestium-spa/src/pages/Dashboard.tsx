import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { SlotCounter } from '../components/common/SlotCounter';
import { RightPanel } from '../components/HUD/RightPanel';
import { SidePanel } from '../components/HUD/SidePanel';
import { Visualizer } from '../components/HUD/Visualizer';
import { useCelestium } from '../hooks/useCelestium';
import { useConstellation } from '../hooks/useConstellation';
import { useStore } from '../store/store';
import type { CosmicSector } from '../store/store';

export function Dashboard() {
  const {
    solar,
    lunarPhase,
    rotation,
    aeon,
    epoch,
    mode,
    toggleMode,
    geoStatus
  } = useCelestium();

  const { focusedSector, setFocusedSector } = useStore();

  const interact = (sector: CosmicSector) => ({
      onMouseEnter: () => setFocusedSector(sector),
      onMouseLeave: () => setFocusedSector(null),
      onClick: () => setFocusedSector(focusedSector === sector ? null : sector),
      className: `cursor-help transition-all duration-300 px-1 py-1 rounded hover:bg-white/5 ${
          focusedSector && focusedSector !== sector ? 'opacity-30 blur-[1px]' : 'opacity-100'
      } ${focusedSector === sector ? 'scale-110' : ''}`
  });

  const starSystem = useConstellation(solar.arc);
  const lp = parseInt(lunarPhase, 10);
  const isHighTide = (lp <= 3) || (lp >= 12 && lp <= 18) || (lp >= 27);
  const tideStatus = isHighTide ? 'High (Spring Tides)' : 'Moderate (Neap Tides)';

  return (
    // ROOT: 
    // - h-[100dvh]: Exact viewport height.
    // - overflow-y-auto: Allow scroll on mobile.
    // - md:overflow-hidden: KILL scroll on desktop.
    <div className="w-screen h-[100dvh] bg-celestium-bg text-celestium-text font-mono flex flex-col items-center overflow-y-auto md:overflow-hidden selection:bg-celestium-gold selection:text-black">

      {/* HEADER: Rigid Height (shrink-0) */}
      <header className="flex flex-col items-center gap-4 z-10 w-full p-4 shrink-0">
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0em", filter: "blur(10px)" }}
          animate={{ opacity: 1, letterSpacing: "0.4em", filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="text-xs md:text-sm text-celestium-text font-mono uppercase font-bold tracking-[0.4em] opacity-80 glow-text"
        >
          Celestium
        </motion.h1>

        {/* GOD STRING */}
        <div className={`text-sm sm:text-lg md:text-3xl lg:text-4xl tracking-widest font-bold text-center transition-colors duration-500 flex flex-wrap items-center justify-center gap-2 sm:gap-2 md:gap-4 ${solar.isNull ? 'text-celestium-null' : ''}`}>
          <div {...interact('AEON')} className={`flex items-center gap-2 text-celestium-dim ${interact('AEON').className}`}>
            <span>{aeon}</span>
            <span className="text-white/20">::</span>
            <span>{epoch}</span>
            <span className="text-white/20">.</span>
          </div>
          <div {...interact('ARC')} className={`flex items-center text-celestium-gold glow-text-gold ${interact('ARC').className}`}>
             {solar.isNull ? (
                <span className="text-celestium-null animate-pulse">NULL</span>
              ) : (
                <SlotCounter value={Math.floor(parseFloat(solar.arc || '0')).toString().padStart(3, '0')} />
              )}
          </div>
          <span className="text-white/20">.</span>
          <div {...interact('PHASE')} className={`text-celestium-cyan glow-text-cyan ${interact('PHASE').className}`}>
             <SlotCounter value={lunarPhase.toString()} />
          </div>
          <span className="text-white/20">|</span>
          <div {...interact('ROTATION')} className={`flex items-center text-celestium-cyan glow-text-cyan ${interact('ROTATION').className}`}>
             <SlotCounter value={rotation} />
             <span className="text-celestium-dim ml-1">°</span>
          </div>
        </div>

        {/* NULL COUNTDOWN */}
        {solar.isNull && (
          <div className="text-celestium-null text-lg animate-pulse mt-2">
            ALIGNMENT PENDING... [{solar.countdown}]
          </div>
        )}
      </header>

      {/* MID SECTION: THE FLEX FIX 
          - flex-1: Take ONLY remaining space.
          - min-h-0: Allow shrinking below content size (prevents blowout).
          - py-4: Small padding to prevent edge touching.
      */}
      <motion.div 
        className="w-full max-w-7xl shrink-0 md:flex-1 md:min-h-0 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 px-4 py-4 md:py-0 relative"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={mode === 'TRUE_SOLAR' ? { 
            opacity: 1, scale: 0.95, filter: "blur(0px)", rotateX: 8, y: 20
        } : { 
            opacity: 1, scale: 1, filter: "blur(0px)", rotateX: 0, y: 0 
        }}
        transition={{ duration: 1.2, ease: "circOut" }}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >

        {/* PANELS: Self-align center */}
        <SidePanel
          constellation={starSystem}
          season={solar.season}
          mode={mode}
          geo={geoStatus}
          onToggleMode={toggleMode}
          onRequestLocation={geoStatus.requestLocation}
          onManualLocation={geoStatus.setManualLocation}
        />

        {/* VISUALIZER CONTAINER: 
            - h-auto: Natural height on mobile.
            - md:h-full: Fill the flex container on desktop.
            - md:max-h-full: Never exceed the flex container.
            - aspect-square: Keep it round.
        */}
        <main className="relative w-full max-w-[340px] md:max-w-none md:w-auto md:h-full md:max-h-full aspect-square flex items-center justify-center order-1 md:order-2">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 border-[0.5px] border-celestium-dim opacity-10 pointer-events-none rounded-full scale-110" />
          
          <Visualizer
            solarArc={parseFloat(solar.arc || '0')}
            rotation={parseFloat(rotation)}
            lunarPhase={parseInt(lunarPhase, 10)}
            isNull={solar.isNull}
          />
        </main>

        <RightPanel geo={geoStatus} />

      </motion.div>

      {/* FOOTER: Rigid Height (shrink-0) */}
      <footer className="w-full max-w-6xl shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6 md:items-center text-xs md:text-sm tracking-widest text-celestium-dim border-t border-white/10 pt-4 pb-4 px-8">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="uppercase text-celestium-gold opacity-50">System Status</span>
          <span className={solar.isNull ? 'text-celestium-null' : 'text-white'}>
            {solar.isNull ? 'NULL INTERVAL' : 'KINETIC YEAR'}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <Link
            to="/help"
            className="text-xs md:text-sm tracking-[0.35em] uppercase text-white hover:text-white transition-colors border border-white/20 px-4 py-2 hover:bg-white/5"
          >
            [ SYSTEM MANUAL ]
          </Link>
        </div>

        <div className="flex flex-col gap-1 text-center md:text-right">
          <span className="uppercase text-celestium-cyan opacity-50">Lunar Effects</span>
          <span className="text-white">{tideStatus}</span>
        </div>
      </footer>

      {/* Version Tag */}
      <div className="text-[10px] text-celestium-dim opacity-20 py-2 shrink-0">
        CELESTIUM.SYS // {aeon}.{epoch}
      </div>
    </div>
  );
}
