import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { EQUINOX_TABLE } from './astronomy';
import { skyAt, phaseWordAt, constellationAtLongitude, dayFraction,
         meridianLongitude, screenAngle, terminatorX } from './sky';

const circ = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const phaseAt = (deg: number) =>
  Astronomy.SearchMoonPhase(deg, new Date('2026-11-01T00:00:00Z'), 40)!.date;

describe('skyAt', () => {
  it('Sun is at 0° at the 2026 equinox in EQUINOX_TABLE', () => {
    const t = EQUINOX_TABLE.find(e => e.year === 2026)!.timestamp;
    expect(circ(skyAt(new Date(t)).sunLon, 0)).toBeLessThan(0.05);
  });
  it('Sun is at 90° at the 2026 June solstice', () => {
    expect(circ(skyAt(Astronomy.Seasons(2026).jun_solstice.date).sunLon, 90)).toBeLessThan(0.05);
  });
  it.each([[0, 'new'], [90, 'first-quarter'], [180, 'full'], [270, 'last-quarter']] as const)(
    'at library phase %i° elong matches and word is %s', (deg, word) => {
      const s = skyAt(phaseAt(deg));
      expect(circ(s.elong, deg)).toBeLessThan(0.05);
      expect(s.phaseWord).toBe(word);
    });
  it('illum ≈ 0 at new and ≈ 1 at full; waxing flips at full', () => {
    expect(skyAt(phaseAt(0)).illum).toBeLessThan(0.001);
    const full = phaseAt(180);
    expect(skyAt(full).illum).toBeGreaterThan(0.999);
    expect(skyAt(new Date(full.getTime() - 864e5)).waxing).toBe(true);
    expect(skyAt(new Date(full.getTime() + 864e5)).waxing).toBe(false);
  });
  it('moonLon = sunLon + elong (mod 360)', () => {
    const s = skyAt(new Date('2026-11-08T12:00:00Z'));
    expect(circ(s.moonLon, s.sunLon + s.elong)).toBeLessThan(1e-9);
  });
  it.each(['1999-12-31T00:00:00Z', '2031-06-01T00:00:00Z', '2100-01-01T00:00:00Z'])(
    'is finite outside the equinox table: %s', iso => {
      const s = skyAt(new Date(iso));
      for (const v of [s.sunLon, s.moonLon, s.elong, s.illum]) expect(Number.isFinite(v)).toBe(true);
      expect(s.sunLon).toBeGreaterThanOrEqual(0);
      expect(s.sunLon).toBeLessThan(360);
    });
});

describe('phaseWordAt', () => {
  it.each([[0, 'new'], [45, 'waxing crescent'], [90, 'first-quarter'], [135, 'waxing gibbous'],
           [180, 'full'], [225, 'waning gibbous'], [270, 'last-quarter'], [315, 'waning crescent'],
           [359, 'new']] as const)('%i° → %s', (e, w) => expect(phaseWordAt(e)).toBe(w));
});

describe('constellationAtLongitude', () => {
  it.each([[28.99, 'PISCES'], [29, 'ARIES'], [247.99, 'SCORPIUS'], [248, 'OPHIUCHUS'],
           [350.99, 'AQUARIUS'], [351, 'PISCES'], [0, 'PISCES'], [360, 'PISCES'],
           [-1, 'PISCES'], [389, 'ARIES']] as const)('%f° → %s', (l, c) =>
    expect(constellationAtLongitude(l)).toBe(c));
});

describe('frame', () => {
  it('dayFraction is local wall-clock', () => {
    expect(dayFraction(new Date(2026, 10, 8, 12, 0, 0))).toBeCloseTo(0.5, 9);
    expect(dayFraction(new Date(2026, 10, 8, 6, 30, 0))).toBeCloseTo(6.5 / 24, 9);
  });
  it('Sun is at the top at noon, bottom at midnight, left (east) at 06:00', () => {
    const S = 225;
    expect(screenAngle(S, meridianLongitude(S, 0.5))).toBeCloseTo(0, 9);
    expect(screenAngle(S, meridianLongitude(S, 0))).toBeCloseTo(180, 9);
    expect(screenAngle(S, meridianLongitude(S, 0.25))).toBeCloseTo(270, 9);
  });
  it('overhead follows the season (prototype said PISCES at every midnight)', () => {
    expect(constellationAtLongitude(meridianLongitude(226, 0))).toBe('ARIES');
  });
  it('terminator is straight at quarter, hugs the limb at new, wraps at full', () => {
    expect(terminatorX(0, 10)).toBeCloseTo(10, 9);
    expect(terminatorX(90, 10)).toBeCloseTo(0, 9);
    expect(terminatorX(180, 10)).toBeCloseTo(-10, 9);
  });
});
