import { create } from 'zustand';

// Define the valid sectors that can be highlighted
export type CosmicSector = 'AEON' | 'ARC' | 'PHASE' | 'ROTATION' | null;

interface CelestiumState {
    mode: 'STANDARD' | 'TRUE_SOLAR';
    setMode: (mode: 'STANDARD' | 'TRUE_SOLAR') => void;

    // [NEW] Focus State for Interactive String
    focusedSector: CosmicSector;
    setFocusedSector: (sector: CosmicSector) => void;
}

export const useStore = create<CelestiumState>((set) => ({
    mode: 'STANDARD',
    setMode: (mode) => set({ mode }),

    // [NEW]
    focusedSector: null,
    setFocusedSector: (sector) => set({ focusedSector: sector }),
}));
