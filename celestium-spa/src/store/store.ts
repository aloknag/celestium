import { create } from 'zustand';

interface CelestiumState {
    mode: 'STANDARD' | 'TRUE_SOLAR';
    setMode: (mode: 'STANDARD' | 'TRUE_SOLAR') => void;
}

export const useStore = create<CelestiumState>((set) => ({
    mode: 'STANDARD',
    setMode: (mode) => set({ mode }),
}));
