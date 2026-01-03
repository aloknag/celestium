import { Link } from 'react-router-dom';

export function Help() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-celestium-bg text-celestium-text font-mono selection:bg-celestium-accent selection:text-black">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <header className="flex flex-col gap-3">
          <div className="text-xs md:text-sm tracking-[0.4em] text-celestium-dim uppercase">
            Celestium
          </div>
          <h1 className="text-2xl md:text-4xl tracking-widest font-bold glow-text">
            Manifesto
          </h1>
          <p className="text-xs md:text-sm tracking-widest text-celestium-dim max-w-3xl">
            Protocol v1.0 — The Planetary Operating System.
          </p>

          <p className="text-xs md:text-sm tracking-widest text-celestium-dim max-w-3xl">
            “We do not watch the clock. We watch the sky.”
          </p>

          <div>
            <Link
              to="/"
              className="inline-flex items-center justify-center text-xs md:text-sm tracking-[0.35em] uppercase text-white border border-celestium-dim/40 px-4 py-2 hover:border-celestium-dim/70 hover:text-white transition-colors"
            >
              [ BACK TO DASHBOARD ]
            </Link>
          </div>
        </header>

        <main className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm md:text-base tracking-[0.35em] uppercase text-celestium-accent opacity-70">
              The Why: Time is Geometry
            </h2>
            <p className="text-xs md:text-sm tracking-widest text-celestium-dim">
              The civil calendar is a political abstraction. It forces the non-integer reality
              of an orbital ellipse into arbitrary boxes and relies on mean time.
            </p>
            <p className="text-xs md:text-sm tracking-widest text-celestium-dim">
              Celestium abandons arbitrary labels for raw astronomical telemetry. We do not ask
              “What time is it?” We ask “Where are we?”
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm md:text-base tracking-[0.35em] uppercase text-celestium-accent opacity-70">
              The Universal Syntax
            </h2>
            <p className="text-xs md:text-sm tracking-widest text-celestium-dim">
              Celestium replaces the standard date/time string with a coordinate vector:
            </p>
            <div className="text-xs md:text-sm tracking-widest text-celestium-text">
              Σ :: Ω . α . λ | ρ
            </div>
            <div className="text-xs md:text-sm tracking-widest text-celestium-text">
              [THE AEON]::[THE EPOCH].[SOLAR ARC].[LUNAR PHASE]|[ROTATION]°
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm md:text-base tracking-[0.35em] uppercase text-celestium-accent opacity-70">
              Terms
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm tracking-widest text-celestium-dim">
              <li>
                <span className="text-celestium-text">Σ — The Aeon</span>: deep time (cycle count since the Theia impact / Moon formation).
              </li>
              <li>
                <span className="text-celestium-text">Ω — The Epoch</span>: axial precession (the Great Year; 0° is alignment with Polaris).
              </li>
              <li>
                <span className="text-celestium-text">α — Solar Arc</span>: orbital progress since the Vernal Equinox (0–360).
              </li>
              <li>
                <span className="text-celestium-text">λ — Lunar Phase</span>: illumination index (00–29); 00 is New Moon; 15 is Full Moon.
              </li>
              <li>
                <span className="text-celestium-text">ρ — Rotation</span>: the daily spin (0–360°).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm md:text-base tracking-[0.35em] uppercase text-celestium-accent opacity-70">
              Seasonal Markers
            </h2>
            <p className="text-xs md:text-sm tracking-widest text-celestium-dim">
              The ring labels track the kinetic year:
              <span className="text-celestium-text"> VE</span> (Vernal Equinox),
              <span className="text-celestium-text"> SS</span> (Summer Solstice),
              <span className="text-celestium-text"> AE</span> (Autumnal Equinox),
              <span className="text-celestium-text"> WS</span> (Winter Solstice).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm md:text-base tracking-[0.35em] uppercase text-celestium-accent opacity-70">
              Mechanics & Protocols
            </h2>
            <div className="space-y-4 text-xs md:text-sm tracking-widest text-celestium-dim">
              <div className="space-y-2">
                <div className="text-celestium-text">Protocol: True Solar</div>
                <p>
                  Standard clocks follow political time zones. True Solar Mode acquires your
                  latitude/longitude, computes the exact moment the Sun crosses your meridian,
                  and realigns that moment to 180.000°.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-celestium-text">Anomaly Handling: The Null Interval</div>
                <p>
                  A perfect circle is 360°, but Earth’s orbit is ~365.24219 days. Celestium runs a
                  perfect 360-degree kinetic year.
                </p>
                <p>
                  When the Solar Arc exceeds 360°, the system enters the Null Interval:
                  status becomes NULL, the coordinate pauses, and a countdown runs until the
                  physical Vernal Equinox resets the cycle.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-celestium-text">The Star Map</div>
                <p>
                  Celestium uses IAU constellation boundaries and includes the 13th sector,
                  Ophiuchus.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 pt-6 border-t border-celestium-dim/30 text-[10px] md:text-xs tracking-widest text-celestium-dim">
          CELESTIUM.SYS // MANIFESTO
        </footer>
      </div>
    </div>
  );
}
