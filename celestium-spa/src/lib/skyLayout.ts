// Where the dial sits on screen. Pure, so "the ring never touches the text" is testable.
// Numbers are CSS px and describe the overlay (SkyOverlay): keep them in sync with it.

export const SPEC = {
    label: 34,                              // ring labels sit rz + 22 out, ~12 px tall, plus a 6 px margin
    desktopMinW: 768,                       // Tailwind md: readout in the top-left corner, controls appear
    wideMinW: 1280,                         // from here the sentence sits beside the controls, below it above them
    shortMaxH: 480,                         // below this height the sentence and the controls are hidden
    corner: { right: 340, bottom: 180 },    // top-left readout block at its widest
    sentence: { bottom: 26, aboveControls: 104, lineDesktop: 27.2, linePhone: 22.1 },
    edge: 8,                                // margin to the screen edge in short windows
} as const;

// Bottom strips: the sentence at its widest wrap, 2 lines on desktop and tablet, 3 on phones.
export const STRIP = {
    wide: SPEC.sentence.bottom + 2 * SPEC.sentence.lineDesktop,
    tablet: SPEC.sentence.aboveControls + 2 * SPEC.sentence.lineDesktop,
    phone: SPEC.sentence.bottom + 3 * SPEC.sentence.linePhone,
};

// Bottom of the centered phone readout: the wordmark on two lines, then a clock and a ρ line
// whose fonts follow the width (clamp(34px, 9vw, 52px) and clamp(15px, 4vw, 19px)).
export function phoneReadoutBottom(w: number): number {
    const clock = Math.min(52, Math.max(34, w * 0.09));
    const rho = Math.min(19, Math.max(15, w * 0.04));
    return 103 + clock + 1.5 * rho;
}

export function dialLayout(w: number, h: number): { cx: number; cy: number; rz: number } {
    const { label, edge, corner } = SPEC;
    const reach = label - 6;                // how far the labels reach beyond the ring
    const base = Math.min(w, h) * 0.4;
    const short = h < SPEC.shortMaxH;

    if (w >= SPEC.desktopMinW) {
        if (short) {
            // Landscape phone or a short window: no sentence and no controls, so the dial takes the space right of the readout.
            const rz = Math.max(40, Math.min(base, (w - corner.right) / 2 - reach - edge, h / 2 - reach - edge));
            return { cx: (corner.right + w) / 2, cy: h / 2, rz };
        }
        const cy = h / 2;
        const strip = w >= SPEC.wideMinW ? STRIP.wide : STRIP.tablet;
        const clearCorner = Math.hypot(w / 2 - corner.right, cy - corner.bottom) - label - 8;
        const clearBottom = h - strip + 6 - cy - label;
        return { cx: w / 2, cy, rz: Math.max(40, Math.min(base, clearCorner, clearBottom)) };
    }

    const top = phoneReadoutBottom(w);
    const strip = short ? edge : STRIP.phone;
    const rz = Math.max(40, Math.min(base, (h - top - strip) / 2 - label));
    const cy = Math.min(Math.max(h / 2, top + rz + label), h - strip - rz - label);
    return { cx: w / 2, cy, rz };
}
