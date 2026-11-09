import { describe, it, expect } from 'vitest';
import { dialLayout } from './skyLayout';

// Overlay geometry the dial must stay clear of, in CSS px. Keep in sync with SkyOverlay.
const LABEL = 34;                          // ring labels sit rz + 22 out and are ~12 px tall
const CORNER = { right: 340, bottom: 180 }; // top-left readout block (from 768 px wide)
const PHONE_TOP = 175;                      // centered readout block (phones)

describe('dialLayout', () => {
  it('leaves a phone dial where it always was: centered, 0.4 of the width', () => {
    const d = dialLayout(390, 844);
    expect(d.cy).toBeCloseTo(422, 6);
    expect(d.rz).toBeCloseTo(156, 6);
  });

  it('keeps the 1280×800 desktop dial at (almost) full size', () => {
    const d = dialLayout(1280, 800);
    expect(d.cy).toBe(400);
    expect(d.rz).toBeGreaterThan(317);
    expect(d.rz).toBeLessThanOrEqual(320);
  });

  it.each([[320, 568], [360, 640], [390, 844], [430, 932]])(
    'phone %i×%i: ring and labels sit below the readout and above the sentence', (w, h) => {
      const { cy, rz } = dialLayout(w, h);
      expect(cy - rz - LABEL).toBeGreaterThanOrEqual(PHONE_TOP - 0.001);
      expect(cy + rz + LABEL).toBeLessThanOrEqual(h - 60 + 6 + 0.001);
    });

  it.each([[768, 1024], [1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [2560, 1440]])(
    'desktop %i×%i: ring and labels clear the corner readout and the bottom strip', (w, h) => {
      const { cy, rz } = dialLayout(w, h);
      expect(Math.hypot(w / 2 - CORNER.right, cy - CORNER.bottom)).toBeGreaterThanOrEqual(rz + LABEL + 8 - 0.001);
      const bottom = w >= 1280 ? 53 : 131;
      expect(cy + rz + LABEL).toBeLessThanOrEqual(h - bottom + 6 + 0.001);
      expect(cy - rz - LABEL).toBeGreaterThanOrEqual(0);
    });
});
