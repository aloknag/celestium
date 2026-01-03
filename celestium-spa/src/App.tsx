import { useCelestium } from './hooks/useCelestium';
import { Visualizer } from './components/HUD/Visualizer';

function App() {
  const {
    godString,
    solar,
    lunarPhase,
    rotation,
    aeon,
    epoch
  } = useCelestium();

  // Tides Logic (00, 15, 29 are High)
  const lp = parseInt(lunarPhase, 10);
  const isHighTide = (lp <= 3) || (lp >= 12 && lp <= 18) || (lp >= 27);
  const tideStatus = isHighTide ? "High (Spring Tides)" : "Moderate (Neap Tides)";

  return (
    <div className="w-screen h-screen bg-celestium-bg text-celestium-text font-mono flex flex-col items-center justify-between p-12 overflow-hidden selection:bg-celestium-accent selection:text-black">

      {/* HEADER / GOD STRING */}
      <header className="flex flex-col items-center gap-4 z-10 w-full">
        <h1 className="text-sm tracking-[0.4em] text-celestium-dim uppercase">Celestium // Protocol v1.0</h1>

        <div className={`text-2xl md:text-4xl lg:text-5xl tracking-widest font-bold text-center glow-text transition-colors duration-500 ${solar.isNull ? 'text-celestium-null' : 'text-celestium-text'}`}>
          {godString}
        </div>

        {solar.isNull && (
          <div className="text-celestium-null text-lg animate-pulse mt-2">
            ALIGNMENT PENDING... [{solar.countdown}]
          </div>
        )}
      </header>

      {/* VISUALIZER */}
      <main className="flex-1 flex items-center justify-center relative w-full">
        {/* Background Grid Lines (Optional Aesth) */}
        <div className="absolute inset-0 border-[0.5px] border-celestium-dim opacity-10 pointer-events-none rounded-full scale-150" />

        <Visualizer
          solarArc={parseFloat(solar.arc || "0")}
          rotation={parseFloat(rotation)}
          lunarPhase={parseInt(lunarPhase, 10)}
          isNull={solar.isNull}
        />
      </main>

      {/* FOOTER / DECODE */}
      <footer className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 text-xs md:text-sm tracking-widest text-celestium-dim border-t border-celestium-dim/30 pt-6">
        <div className="flex flex-col gap-1">
          <span className="uppercase text-celestium-accent opacity-50">System Status</span>
          <span className={solar.isNull ? "text-celestium-null" : "text-white"}>
            {solar.isNull ? "NULL INTERVAL (Rebooting)" : "KINETIC YEAR (Operational)"}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-center">
          <span className="uppercase text-celestium-accent opacity-50">Season Vector</span>
          <span className="text-white">{solar.season}</span>
        </div>

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
