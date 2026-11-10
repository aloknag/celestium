import { describe, it, expect } from 'vitest';
import { stepModelTime, MAX_DT_MS } from './skyClock';

describe('stepModelTime', () => {
  it('now → wall clock, ignoring prev and dt', () => expect(stepModelTime(1, 16, 'now', 123)).toBe(123));
  it('pause → unchanged', () => expect(stepModelTime(7, 16, 'pause', 123)).toBe(7));
  it('ignores negative dt', () => expect(stepModelTime(10, -5, 'day', 0)).toBe(10));
  it('clamps long frames to MAX_DT_MS (backgrounded tab)', () =>
    expect(stepModelTime(0, 5000, 'year', 0)).toBe(stepModelTime(0, MAX_DT_MS, 'year', 0)));
  it.each([['day', 22, 86400], ['month', 26, 29.530588853 * 86400], ['year', 34, 365.25 * 86400]] as const)(
    '%s: %i s of real time = one cycle', (mode, secs, cycleSec) => {
      let t = 0;
      for (let i = 0; i < (secs * 1000) / MAX_DT_MS; i++) t = stepModelTime(t, MAX_DT_MS, mode, 0);
      expect(t / 1000).toBeCloseTo(cycleSec, 0);
    });
});
