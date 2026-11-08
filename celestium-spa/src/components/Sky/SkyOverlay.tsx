import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { constellationAtLongitude } from '../../lib/sky';
import type { SkySnapshot } from '../../lib/sky';
import { MODE_LABEL } from '../../lib/skyClock';
import type { SkyMode } from '../../lib/skyClock';
import { formatClock, formatRho, titleCase } from '../../lib/skyFormat';

interface SkyOverlayProps {
    snapshot: SkySnapshot | null;
    mode: SkyMode;
    onModeChange: (m: SkyMode) => void;
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

const CONTROLS: ReadonlyArray<{ mode: SkyMode; text: string; label?: string }> = [
    { mode: 'now', text: 'NOW' },
    { mode: 'day', text: 'DAY' },
    { mode: 'month', text: 'MONTH' },
    { mode: 'year', text: 'YEAR' },
    { mode: 'pause', text: '❚❚', label: 'Pause' },
];

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night-sun';

// Quiet DOM layer over the canvas: clock ⇄ ρ readout, the celestial sentence,
// time-warp controls, and the way onward to the HUD. The text blocks are plain
// text (no live regions): they refresh ~8 Hz and would flood a screen reader.
export function SkyOverlay({ snapshot, mode, onModeChange }: SkyOverlayProps): ReactElement {
    const clock = snapshot ? formatClock(snapshot.dayFrac) : null;
    const frozen = snapshot?.frozen ?? false;
    const name = (lon: number | undefined) => (lon === undefined ? '—' : titleCase(constellationAtLongitude(lon)));

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between px-4 pb-3 pt-5 text-center">
            <div className="flex flex-col items-center">
                <div className="font-sky-mono text-xs uppercase indent-[0.55em] tracking-[0.55em] text-night-dim">Celestium</div>
                <div className="mt-1.5 text-[13px] italic text-night-dim/80">We do not watch the clock. We watch the sky.</div>

                <div data-sky="readout" className="mt-5 font-sky-mono tabular-nums [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
                    <div className="text-[clamp(34px,9vw,52px)] leading-none">
                        <span>{clock ? clock.time : '--:--:--'}</span>
                        <span className="ml-[0.25em] text-[0.4em] text-night-dim">{clock ? clock.ampm : '--'}</span>
                    </div>
                    <div className="mt-1.5 text-[clamp(15px,4vw,19px)] text-night-sun">
                        <span className="mr-[0.3em] italic text-night-dim">ρ</span>
                        <span>{snapshot ? formatRho(snapshot.dayFrac) : '000'}</span>
                        <span className="text-night-dim">°</span>
                    </div>
                    <div className="mt-1 text-xs tracking-[0.12em] text-night-dim">{snapshot ? DATE_FMT.format(snapshot.date) : '—'}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-night-dim/80">{MODE_LABEL[mode]}</div>
                </div>
            </div>

            <div className="flex w-full flex-col items-center gap-3">
                <p
                    data-sky="sentence"
                    className="w-[min(680px,92vw)] text-[clamp(13px,2.3vw,16px)] leading-[1.7] text-night-dim [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]"
                >
                    <span className="italic text-night-sun">Sun in <b className="font-semibold">{name(snapshot?.sky.sunLon)}</b></span>
                    {' · '}
                    <span className="italic text-night-moon">
                        <b className="font-semibold">{snapshot ? snapshot.sky.phaseWord : '—'}</b> Moon in{' '}
                        <b className="font-semibold">{name(snapshot?.sky.moonLon)}</b>
                    </span>
                    {!frozen && (
                        <>
                            {' · '}
                            <span className="text-night-text"><b className="font-semibold">{name(snapshot?.meridianLon)}</b> overhead</span>
                        </>
                    )}
                </p>

                <div data-sky="controls" className="pointer-events-auto flex flex-col items-center gap-2.5">
                    <div className="font-sky-mono text-[10px] uppercase tracking-[0.28em] text-night-dim">Watch a rhythm pass</div>
                    <div role="group" aria-label="Time rhythm" className="flex flex-nowrap justify-center gap-1.5 min-[481px]:gap-2">
                        {CONTROLS.map(c => {
                            const active = mode === c.mode;
                            return (
                                <button
                                    key={c.mode}
                                    type="button"
                                    aria-pressed={active}
                                    aria-label={c.label}
                                    onClick={() => onModeChange(c.mode)}
                                    className={`min-h-[44px] min-w-[44px] touch-manipulation rounded-full border bg-[rgba(16,21,38,0.5)] px-2.5 py-[9px] font-sky-mono text-[11px] tracking-[0.02em] backdrop-blur-[6px] transition-all duration-200 min-[481px]:px-[17px] min-[481px]:py-2.5 min-[481px]:text-xs min-[481px]:tracking-[0.08em] ${FOCUS} ${
                                        active
                                            ? 'border-[rgba(255,206,138,0.55)] text-night-sun shadow-[0_0_16px_rgba(255,206,138,0.18)]'
                                            : 'border-[rgba(190,205,255,0.16)] text-night-dim hover:text-night-text'
                                    }`}
                                >
                                    {c.text}
                                </button>
                            );
                        })}
                    </div>
                    <div className="max-w-[90vw] font-sky-mono text-[11px] tracking-[0.12em] text-night-dim">
                        Geocentric living model · accelerated · positions approximate
                    </div>
                </div>

                <nav data-sky="nav" aria-label="Celestium" className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-6 text-sm text-night-dim">
                    <Link to="/cosmos" className={`inline-flex min-h-[44px] items-center transition-colors hover:text-night-text ${FOCUS}`}>Open the instrument →</Link>
                    <Link to="/help" className={`inline-flex min-h-[44px] items-center transition-colors hover:text-night-text ${FOCUS}`}>Manifesto</Link>
                </nav>
            </div>
        </div>
    );
}
