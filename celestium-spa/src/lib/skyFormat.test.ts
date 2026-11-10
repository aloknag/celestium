import { describe, it, expect } from 'vitest';
import { formatClock, formatRho, titleCase } from './skyFormat';

describe('formatClock (12-hour, from the day fraction)', () => {
  it.each([
    [0, '12:00:00', 'AM'],
    [6.5 / 24, '6:30:00', 'AM'],
    [0.5, '12:00:00', 'PM'],
    [(13 * 3600 + 5 * 60 + 9) / 86400, '1:05:09', 'PM'],
    [(23 * 3600 + 59 * 60 + 59.9) / 86400, '11:59:59', 'PM'],
  ] as const)('%f → %s %s', (f, time, ampm) => expect(formatClock(f)).toEqual({ time, ampm }));
});

describe('formatRho', () => {
  it.each([[0, '000'], [0.5, '180'], [0.25, '090'], [0.99999, '359']] as const)(
    '%f → %s', (f, s) => expect(formatRho(f)).toBe(s));
});

describe('titleCase', () => {
  it.each([['OPHIUCHUS', 'Ophiuchus'], ['PISCES', 'Pisces'], ['scorpius', 'Scorpius']] as const)(
    '%s → %s', (a, b) => expect(titleCase(a)).toBe(b));
});
