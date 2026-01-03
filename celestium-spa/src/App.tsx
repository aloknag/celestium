import { useCelestium } from './hooks/useCelestium';
import { Visualizer } from './components/HUD/Visualizer';
import { SlotCounter } from './components/common/SlotCounter';
import { useState } from 'react';

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

  // Tides Logic
  const lp = parseInt(lunarPhase, 10);
  const isHighTide = (lp <= 3) || (lp >= 12 && lp <= 18) || (lp >= 27);
  const tideStatus = isHighTide ? "High (Spring Tides)" : "Moderate (Neap Tides)";

  // Simulation State
  const [isSimulatingNull, setIsSimulatingNull] = useState(false);

  // Override solar state if simulating
  const displaySolar = isSimulatingNull ? {
    ...solar,
    isNull: true,
    arc: null,
    countdown: "0d 0h 0m 5s (TEST)"
  } : solar;

  const toggleSimulation = () => {
    setIsSimulatingNull(!isSimulatingNull);
  };

  return (
    <div className="w-screen h-screen bg-celestium-bg text-celestium-text font-mono flex flex-col items-center justify-between p-12 overflow-hidden selection:bg-celestium-accent selection:text-black">

      {/* HEADER / GOD STRING */}
      <header className="flex flex-col items-center gap-4 z-10 w-full">
        <h1 className="text-sm tracking-[0.4em] text-celestium-dim uppercase">Celestium // Protocol v1.0</h1>

        {/* ANIMATED GOD STRING */}
        <div className={`text-xl md:text-3xl lg:text-4xl tracking-widest font-bold text-center glow-text transition-colors duration-500 flex items-center justify-center gap-2 md:gap-4 ${displaySolar.isNull ? 'text-celestium-null' : 'text-celestium-text'}`}>
          <div className="flex items-center gap-2 cursor-pointer hover:text-celestium-accent transition-colors" onClick={toggleSimulation} title="Click to Simulate Null Interval">
            <span>{aeon}</span>
            <span className="text-celestium-dim">::</span>
            <span>{epoch}</span>
            <span className="text-celestium-dim">.</span>
          </div>

          {displaySolar.isNull ? (
            <span className="text-celestium-null animate-pulse">NULL</span>
          ) : (
            <SlotCounter value={Math.floor(parseFloat(displaySolar.arc || "0")).toString().padStart(3, '0')} />
          )}

          <span className="text-celestium-dim">.</span>
          <SlotCounter value={lunarPhase.toString()} />

          <span className="text-celestium-dim">|</span>
          <SlotCounter value={rotation} />
          <span className="text-celestium-dim">°</span>
        </div>

        {displaySolar.isNull && (
          <div className="text-celestium-null text-lg animate-pulse mt-2">
            ALIGNMENT PENDING... [{displaySolar.countdown}]
          </div>
        )}
      </header>

      {/* VISUALIZER */}
      <main className="flex-1 flex items-center justify-center relative w-full">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 border-[0.5px] border-celestium-dim opacity-10 pointer-events-none rounded-full scale-150" />

        <Visualizer
          solarArc={parseFloat(displaySolar.arc || "0")}
          rotation={parseFloat(rotation)}
          lunarPhase={parseInt(lunarPhase, 10)}
          isNull={displaySolar.isNull}
        />
      </main>

      {/* FOOTER / DECODE */}
      <footer className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 text-xs md:text-sm tracking-widest text-celestium-dim border-t border-celestium-dim/30 pt-6">

        {/* Left Col: System Status */}
        <div className="flex flex-col gap-1">
          <span className="uppercase text-celestium-accent opacity-50">System Status</span>
          <span className={displaySolar.isNull ? "text-celestium-null" : "text-white"}>
            {displaySolar.isNull ? "NULL INTERVAL (Rebooting)" : "KINETIC YEAR (Operational)"}
          </span>
        </div>

        {/* Center Col: Rotation Mode (TOGGLE) */}
        <div className="flex flex-col gap-1 text-center items-center">
          <span className="uppercase text-celestium-accent opacity-50">Rotation Protocol</span>
          <button
            onClick={toggleMode}
            className={`px-3 py-1 rounded border transition-all uppercase text-[10px] tracking-widest ${mode === 'TRUE_SOLAR'
              ? 'border-celestium-accent text-celestium-accent bg-celestium-accent/10 shadow-[0_0_10px_rgba(0,255,157,0.3)]'
              : 'border-celestium-dim text-celestium-dim hover:border-white hover:text-white'
              }`}
          >
            {mode === 'TRUE_SOLAR' ? 'TRUE SOLAR' : 'STANDARD ISO'}
          </button>
          {/* Geo Feedback */}
          {mode === 'TRUE_SOLAR' && !geoStatus.latitude && (
            <span className="text-[9px] animate-pulse text-celestium-accent">
              {geoStatus.loading ? "TRIANGULATING..." : "WAITING FOR SIGNAL"}
            </span>
          )}
          {mode === 'TRUE_SOLAR' && geoStatus.latitude && geoStatus.longitude && (
            <span className="text-[9px] text-celestium-accent">
              LOC: [{geoStatus.latitude.toFixed(2)}, {geoStatus.longitude.toFixed(2)}]
            </span>
          )}
          {geoStatus.error && <span className="text-[9px] text-red-500">{geoStatus.error}</span>}
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
