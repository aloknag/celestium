import type { ReactElement } from 'react';
import { constellationAtLongitude } from '../../lib/sky';
import type { SkySnapshot } from '../../lib/sky';
import { MODE_LABEL } from '../../lib/skyClock';
import type { SkyMode } from '../../lib/skyClock';
import { formatClock, formatRho, titleCase } from '../../lib/skyFormat';
import { SkyMenu } from './SkyMenu';

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

// Quiet DOM layer over the canvas. Keep the geometry in sync with lib/skyLayout.ts.
//  - Phones: wordmark and readout centered above the dial, Menu top-right, the sentence along the bottom.
//  - From 768 px: wordmark and readout in the top-left corner, rhythm controls bottom-right.
// The wordmark doubles as the mode badge: "Live sky" in NOW, "Simulated" while DAY / MONTH / YEAR run.
// Text blocks are plain text (no live regions): they refresh ~8 Hz and would flood a screen reader.
export function SkyOverlay({ snapshot, mode, onModeChange }: SkyOverlayProps): ReactElement {
    const clock = snapshot ? formatClock(snapshot.dayFrac) : null;
    const frozen = snapshot?.frozen ?? false;
    const name = (lon: number | undefined) => (lon === undefined ? '—' : titleCase(constellationAtLongitude(lon)));
    const simulated = mode === 'day' || mode === 'month' || mode === 'year';
    const status = mode === 'now' ? 'Live sky' : mode === 'pause' ? 'Paused' : 'Simulated';

    return (
        <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute inset-x-0 top-0 px-4 pt-5 text-center md:right-auto md:px-7 md:pt-6 md:text-left">
                <div data-sky="wordmark" className="flex flex-col items-center gap-[7px] font-sky-mono text-xs uppercase leading-none tracking-[0.45em] text-night-dim md:block md:tracking-[0.55em]">
                    <span className="indent-[0.45em] md:indent-0">Celestium</span>
                    <span className="hidden md:inline">:</span>{' '}
                    <span
                        className={`indent-[0.32em] text-[10px] tracking-[0.32em] md:indent-0 md:text-xs md:tracking-[0.55em] ${simulated ? 'text-night-sun' : ''}`}
                    >
                        {status}
                    </span>
                </div>

                <div data-sky="readout" className="mt-[26px] font-sky-mono tabular-nums [text-shadow:0_2px_18px_rgba(0,0,0,0.6)] md:mt-[18px]">
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
                </div>
            </div>

            <div data-sky="menu" className="absolute right-4 top-3.5 md:right-6 md:top-[18px]">
                <SkyMenu />
            </div>

            <p
                data-sky="sentence"
                className="absolute bottom-[26px] left-1/2 w-[min(680px,92vw)] -translate-x-1/2 text-center text-[clamp(13px,2.3vw,16px)] leading-[1.7] text-night-dim [text-shadow:0_2px_14px_rgba(0,0,0,0.7)] md:bottom-[104px] min-[1280px]:bottom-[26px] min-[1280px]:w-[min(680px,calc(100vw-780px))] [@media(max-height:479.98px)]:hidden"
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

            <div data-sky="controls" className="pointer-events-auto absolute bottom-[26px] right-7 hidden flex-col items-end gap-2 md:flex [@media(max-height:479.98px)]:hidden">
                <div className="font-sky-mono text-[10px] uppercase tracking-[0.28em] text-night-dim">Watch a rhythm pass</div>
                <div role="group" aria-label="Time rhythm" className="flex gap-2">
                    {CONTROLS.map(c => {
                        const active = mode === c.mode;
                        return (
                            <button
                                key={c.mode}
                                type="button"
                                aria-pressed={active}
                                aria-label={c.label}
                                title={MODE_LABEL[c.mode]}
                                onClick={() => onModeChange(c.mode)}
                                className={`min-h-[44px] min-w-[44px] touch-manipulation rounded-full border bg-[rgba(16,21,38,0.5)] px-[17px] py-2.5 font-sky-mono text-xs tracking-[0.08em] backdrop-blur-[6px] transition-all duration-200 ${FOCUS} ${
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
            </div>
        </div>
    );
}
