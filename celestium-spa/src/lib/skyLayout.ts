// Where the dial sits on screen. Pure, so "the ring never touches the text" is testable.
// Constants are CSS px and describe the overlay (SkyOverlay): keep them in sync with it.

const LABEL = 34;                           // ring labels sit rz + 22 out and are ~12 px tall
const DESKTOP_MIN_W = 768;                  // Tailwind md: readout moves to the top-left corner, controls appear
const WIDE_MIN_W = 1280;                    // below this the sentence sits above the controls, not beside them
const CORNER = { right: 340, bottom: 180 }; // top-left readout block
const PHONE = { top: 175, bottom: 60 };     // centered readout above the dial, sentence below

export function dialLayout(w: number, h: number): { cy: number; rz: number } {
    const base = Math.min(w, h) * 0.4;
    if (w >= DESKTOP_MIN_W) {
        const cy = h / 2;
        const strip = w >= WIDE_MIN_W ? 53 : 131; // bottom strip: the sentence (and, below 1280, the row above the controls)
        const clearCorner = Math.hypot(w / 2 - CORNER.right, cy - CORNER.bottom) - LABEL - 8;
        const clearBottom = h - strip + 6 - cy - LABEL;
        return { cy, rz: Math.max(80, Math.min(base, clearCorner, clearBottom)) };
    }
    const rz = Math.max(80, Math.min(base, (h - PHONE.top - PHONE.bottom) / 2 - LABEL));
    const cy = Math.min(Math.max(h / 2, PHONE.top + rz + LABEL), h - PHONE.bottom - rz - LABEL);
    return { cy, rz };
}
