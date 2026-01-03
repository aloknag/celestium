import { useCelestium } from './hooks/useCelestium';
import { SidePanel } from './components/HUD/SidePanel';
import { Visualizer } from './components/HUD/Visualizer';
import { LegendPanel } from './components/HUD/LegendPanel';
import { useConstellation } from './hooks/useConstellation';
import { SlotCounter } from './components/common/SlotCounter';

function App() {
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

  // 1. Get the Star System
  const starSystem = useConstellation(solar.arc);

  // Tides Logic
  const lp = parseInt(lunarPhase, 10);
  const isHighTide = (lp <= 3) || (lp >= 12 && lp <= 18) || (lp >= 27);
  const tideStatus = isHighTide ? "High (Spring Tides)" : "Moderate (Neap Tides)";

  return (
    <div className="w-screen h-screen bg-celestium-bg text-celestium-text font-mono flex flex-col items-center justify-between overflow-hidden selection:bg-celestium-accent selection:text-black">

      {/* HEADER / GOD STRING */}
      <header className="flex flex-col items-center gap-4 z-10 w-full p-4 md:p-8 shrink-0">
        <h1 className="text-xs md:text-sm tracking-[0.4em] text-celestium-dim uppercase">Celestium</h1>

        {/* LIVE GOD STRING */}
        <div className={`text-xl md:text-3xl lg:text-4xl tracking-widest font-bold text-center glow-text transition-colors duration-500 flex items-center justify-center gap-2 md:gap-4 ${solar.isNull ? 'text-celestium-null' : 'text-celestium-text'}`}>
          <div className="flex items-center gap-2">
            <span>{aeon}</span>
            <span className="text-celestium-dim">::</span>
            <span>{epoch}</span>
            <span className="text-celestium-dim">.</span>
          </div>

          {solar.isNull ? (
            <span className="text-celestium-null animate-pulse">NULL</span>
          ) : (
            <SlotCounter value={Math.floor(parseFloat(solar.arc || "0")).toString().padStart(3, '0')} />
          )}

          <span className="text-celestium-dim">.</span>
          <SlotCounter value={lunarPhase.toString()} />

          <span className="text-celestium-dim">|</span>
          <SlotCounter value={rotation} />
          <span className="text-celestium-dim">°</span>
        </div>

        {/* UNIVERSAL SYNTAX (Helper) */}
        <div className="text-[10px] md:text-xs tracking-widest text-celestium-dim text-center max-w-2xl">
          <div className="uppercase tracking-[0.25em] opacity-70">The Universal Syntax</div>
          <div className="mt-1">
            <span
              className="underline decoration-dotted underline-offset-2 cursor-help"
              title="The Aeon: deep-time odometer (precession cycles since the Moon formed)."
            >
              [THE AEON]
            </span>
            <span className="mx-1">::</span>
            <span
              className="underline decoration-dotted underline-offset-2 cursor-help"
              title="The Epoch: progress through the current precession cycle (Polaris era angle)."
            >
              [THE EPOCH]
            </span>
            <span className="mx-1">.</span>
            <span
              className="underline decoration-dotted underline-offset-2 cursor-help"
              title="Solar Arc: Earth’s orbital position since the Vernal Equinox (0–360)."
            >
              [SOLAR ARC]
            </span>
            <span className="mx-1">.</span>
            <span
              className="underline decoration-dotted underline-offset-2 cursor-help"
              title="Lunar Phase: Moon illumination index (00–29)."
            >
              [LUNAR PHASE]
            </span>
            <span className="mx-1">|</span>
            <span
              className="underline decoration-dotted underline-offset-2 cursor-help"
              title="Rotation: your local spin angle relative to the Sun (0–360°)."
            >
              [ROTATION]
            </span>
          </div>
        </div>

        {/* REAL NULL INTERVAL COUNTDOWN */}
        {solar.isNull && (
          <div className="text-celestium-null text-lg animate-pulse mt-2">
            ALIGNMENT PENDING... [{solar.countdown}]
          </div>
        )}
      </header>

      {/* MID SECTION: Responsive Container */}
      {/* On Mobile: Flex-col, SidePanel (order 2) below Visualizer */}
      {/* On Desktop: Flex-row, SidePanel (order 1) left of Visualizer */}
      <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 relative px-4 pb-4 md:py-8 overflow-hidden">

        {/* LEFT PANEL */}
        <SidePanel
          constellation={starSystem}
          season={solar.season}
          mode={mode}
          geo={geoStatus}
          onToggleMode={toggleMode}
          onRequestLocation={geoStatus.requestLocation}
          onManualLocation={geoStatus.setManualLocation}
        />

        {/* VISUALIZER Container */}
        {/* ensure it shrinks to fit available space */}
        <main className="flex-1 flex items-center justify-center relative w-full h-full max-h-[50vh] md:max-h-full min-h-0 order-1 md:order-2">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 border-[0.5px] border-celestium-dim opacity-30 pointer-events-none rounded-full scale-150" />
          <Visualizer
            solarArc={parseFloat(solar.arc || "0")}
            rotation={parseFloat(rotation)}
            lunarPhase={parseInt(lunarPhase, 10)}
            isNull={solar.isNull}
          />
        </main>

        {/* LEGEND PANEL */}
        <LegendPanel />

      </div>

      {/* FOOTER / DECODE */}
      <footer className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 text-xs md:text-sm tracking-widest text-celestium-dim border-t border-celestium-dim/30 pt-6 pb-8 px-8">

        {/* Left Col: System Status */}
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="uppercase text-celestium-accent opacity-50">System Status</span>
          <span className={solar.isNull ? "text-celestium-null" : "text-white"}>
            {solar.isNull ? "NULL INTERVAL" : "KINETIC YEAR"}
          </span>
        </div>

        {/* Right Col: Lunar */}
        <div className="flex flex-col gap-1 text-right">
          <span className="uppercase text-celestium-accent opacity-50">Lunar Effects</span>
          <span className="text-white">{tideStatus}</span>
        </div>

      </footer>

      {/* Version Tag */}
      <div className="absolute bottom-2 right-4 text-[10px] text-celestium-dim opacity-20">
        CELESTIUM.SYS // {aeon}.{epoch}
      </div>
    </div>
  );
}

export default App;
