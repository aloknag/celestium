// Formatting for the Living Sky readout. The clock is derived from the day
// fraction (not from a Date) so it stays constant while MONTH/YEAR pin the wheel.

const pad2 = (n: number) => String(n).padStart(2, '0');
const EPS = 1e-6; // guards float error, e.g. (6.5 / 24) * 86400 = 23399.999999999996

export function formatClock(dayFrac: number): { time: string; ampm: 'AM' | 'PM' } {
    const total = Math.min(86399, Math.max(0, Math.floor(dayFrac * 86400 + EPS)));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { time: `${h12}:${pad2(m)}:${pad2(s)}`, ampm: h >= 12 ? 'PM' : 'AM' };
}

// ρ in whole degrees, zero-padded to three digits.
export function formatRho(dayFrac: number): string {
    return String(Math.min(359, Math.max(0, Math.floor(dayFrac * 360 + EPS)))).padStart(3, '0');
}

export function titleCase(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
