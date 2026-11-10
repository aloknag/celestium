import { describe, it, expect } from 'vitest';
import { dialLayout, phoneReadoutBottom, SPEC, STRIP } from './skyLayout';

const REACH = 28;   // ring labels reach rz + 28 from the dial centre
const EDGE = 8;     // margin to the screen edge

describe('phoneReadoutBottom', () => {
  it('follows the readout block: about 160 px on a 320 px phone, 184 px from 578 px up', () => {
    expect(phoneReadoutBottom(320)).toBeCloseTo(159.5, 1);
    expect(phoneReadoutBottom(767)).toBeCloseTo(183.5, 1);
  });
});

describe('STRIP reserves a wrapped sentence', () => {
  it('two lines on desktop and tablet, three on phones, on top of their bottom offsets', () => {
    expect(STRIP.wide).toBeGreaterThanOrEqual(26 + 2 * 27.2);
    expect(STRIP.tablet).toBeGreaterThanOrEqual(104 + 2 * 27.2);
    expect(STRIP.phone).toBeGreaterThanOrEqual(26 + 3 * 22.1);
  });
});

describe('dialLayout', () => {
  it('leaves a tall phone dial where it always was: centered, 0.4 of the width', () => {
    const d = dialLayout(390, 844);
    expect(d.cx).toBe(195);
    expect(d.cy).toBeCloseTo(422, 6);
    expect(d.rz).toBeCloseTo(156, 6);
  });

  it('keeps a full-HD window at (almost) full size: 0.4 of the height minus a sliver for the sentence strip', () => {
    const { rz } = dialLayout(1920, 1080);
    expect(rz).toBeGreaterThan(431);
    expect(rz).toBeLessThanOrEqual(432);
  });

  it('1280×800 leaves room for a two-line sentence (about 290 px radius)', () => {
    const { rz } = dialLayout(1280, 800);
    expect(rz).toBeGreaterThan(285);
    expect(rz).toBeLessThan(295);
  });

  it.each([[320, 568], [360, 640], [375, 553], [390, 844], [430, 932], [600, 900], [767, 1024]])(
    'phone %i×%i: ring and labels sit between the readout and a three-line sentence', (w, h) => {
      const { cx, cy, rz } = dialLayout(w, h);
      expect(cx).toBe(w / 2);
      expect(cy - rz - SPEC.label).toBeGreaterThanOrEqual(phoneReadoutBottom(w) - 0.001);
      expect(cy + rz + SPEC.label).toBeLessThanOrEqual(h - STRIP.phone + 0.001);
    });

  it.each([[768, 1024], [1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [2560, 1440]])(
    'desktop %i×%i: ring and labels clear the corner readout and a two-line sentence', (w, h) => {
      const { cx, cy, rz } = dialLayout(w, h);
      expect(cx).toBe(w / 2);
      expect(Math.hypot(cx - SPEC.corner.right, cy - SPEC.corner.bottom)).toBeGreaterThanOrEqual(rz + SPEC.label + 8 - 0.001);
      const strip = w >= SPEC.wideMinW ? STRIP.wide : STRIP.tablet;
      expect(cy + rz + REACH).toBeLessThanOrEqual(h - strip + 0.001);
      expect(cy - rz - SPEC.label).toBeGreaterThanOrEqual(0);
    });

  it.each([[844, 390], [932, 430], [1024, 460], [800, 360]])(
    'short wide window %i×%i: no sentence, the dial moves right of the readout and stays on screen', (w, h) => {
      const { cx, cy, rz } = dialLayout(w, h);
      expect(rz).toBeGreaterThanOrEqual(40);
      expect(cx - rz - REACH).toBeGreaterThanOrEqual(SPEC.corner.right + EDGE - 0.001);
      expect(cx + rz + REACH).toBeLessThanOrEqual(w - EDGE + 0.001);
      expect(cy - rz - REACH).toBeGreaterThanOrEqual(EDGE - 0.001);
      expect(cy + rz + REACH).toBeLessThanOrEqual(h - EDGE + 0.001);
    });

  it.each([[667, 375], [740, 360]])(
    'short narrow window %i×%i: no sentence, ring and labels sit below the centered readout', (w, h) => {
      const { cy, rz } = dialLayout(w, h);
      expect(rz).toBeGreaterThanOrEqual(40);
      expect(cy - rz - SPEC.label).toBeGreaterThanOrEqual(phoneReadoutBottom(w) - 0.001);
      expect(cy + rz + REACH).toBeLessThanOrEqual(h - EDGE + 0.001);
    });
});
