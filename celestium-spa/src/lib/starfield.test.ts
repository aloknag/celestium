import { describe, it, expect } from 'vitest';
import { buildStarfield, starCount } from './starfield';

describe('starfield', () => {
  it('starCount = round(w*h/4200)', () => expect(starCount(1280, 800)).toBe(244));
  it('is deterministic per seed and differs across seeds', () => {
    expect(buildStarfield(7, 100)).toEqual(buildStarfield(7, 100));
    expect(buildStarfield(7, 100).stars).not.toEqual(buildStarfield(8, 100).stars);
  });
  it('is prefix-stable, so a resize never re-rolls stars', () => {
    const big = buildStarfield(7, 100), small = buildStarfield(7, 50);
    expect(big.stars.slice(0, 50)).toEqual(small.stars);
    expect(big.haze.slice(0, small.haze.length)).toEqual(small.haze);
    expect(big.haze).toHaveLength(70);
  });
  it('keeps values in range', () => {
    const { stars, haze } = buildStarfield(3, 300);
    for (const s of stars) { expect(s.rad).toBeGreaterThanOrEqual(0); expect(s.rad).toBeLessThanOrEqual(1);
                             expect(s.lon).toBeGreaterThanOrEqual(0); expect(s.lon).toBeLessThan(360); }
    for (const h of haze) { expect(h.rad).toBeGreaterThanOrEqual(0.5); expect(h.rad).toBeLessThanOrEqual(1); }
  });
});
