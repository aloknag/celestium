import { useEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, ReactElement } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ITEMS = [
    { to: '/cosmos', label: 'Open the instrument' },
    { to: '/help', label: 'Manifesto' },
] as const;

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night-sun';

// Top-right disclosure menu: a button that reveals the way onward to the HUD and the manifesto.
// Closes on Escape, on a press outside, when focus leaves, or when an item is picked.
export function SkyMenu(): ReactElement {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const focusFirstRef = useRef(false);
    const reduced = useReducedMotion() ?? false;

    useEffect(() => {
        if (!open) return;
        if (focusFirstRef.current) {
            focusFirstRef.current = false;
            rootRef.current?.querySelector('a')?.focus();
        }
        const onPress = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPress);
        return () => document.removeEventListener('pointerdown', onPress);
    }, [open]);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' && open) {
            setOpen(false);
            buttonRef.current?.focus();
            return;
        }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (!open) {
            if (e.key === 'ArrowDown' && e.target === buttonRef.current) {
                e.preventDefault();
                focusFirstRef.current = true;
                setOpen(true);
            }
            return;
        }
        const links = Array.from(rootRef.current?.querySelectorAll('a') ?? []);
        const i = links.indexOf(document.activeElement as HTMLAnchorElement);
        const down = e.key === 'ArrowDown';
        const next = i === -1 ? (down ? 0 : links.length - 1) : (i + (down ? 1 : -1) + links.length) % links.length;
        e.preventDefault();
        links[next]?.focus();
    };

    const onBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
    };

    return (
        <div ref={rootRef} className="pointer-events-auto relative" onKeyDown={onKeyDown} onBlur={onBlur}>
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls={open ? 'sky-menu' : undefined}
                onClick={() => setOpen(o => !o)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-[rgba(16,21,38,0.5)] px-4 font-sky-mono text-[11px] uppercase tracking-[0.16em] backdrop-blur-[6px] transition-colors ${FOCUS} ${
                    open ? 'border-[rgba(255,206,138,0.55)] text-night-sun' : 'border-[rgba(190,205,255,0.16)] text-night-dim hover:text-night-text'
                }`}
            >
                <span>Menu</span>
                <svg
                    width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <motion.ul
                    id="sky-menu"
                    initial={reduced ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0 : 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-[calc(100%+8px)] z-20 m-0 min-w-[236px] list-none rounded-2xl border border-[rgba(190,205,255,0.18)] bg-[rgba(9,13,26,0.88)] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-[14px]"
                >
                    {ITEMS.map((item, i) => (
                        <li key={item.to} className={i > 0 ? 'border-t border-[rgba(190,205,255,0.1)]' : ''}>
                            <Link
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className={`group flex min-h-[44px] items-center justify-between gap-[18px] rounded-[11px] px-3.5 text-[15px] text-night-text no-underline transition-colors hover:bg-[rgba(190,205,255,0.08)] focus-visible:bg-[rgba(190,205,255,0.08)] ${FOCUS}`}
                            >
                                {item.label}
                                <span aria-hidden="true" className="text-night-dim transition group-hover:translate-x-0.5 group-hover:text-night-sun group-focus-visible:text-night-sun">→</span>
                            </Link>
                        </li>
                    ))}
                </motion.ul>
            )}
        </div>
    );
}
