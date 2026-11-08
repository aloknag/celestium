/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                celestium: {
                    bg: '#050505',
                    solar: '#FFB800',    // Amber Gold
                    observer: '#00D1FF', // Electric Cyan
                    lunar: '#E0E0E0',    // Moon Silver
                    text: '#E0E0E0',     // [FIX] Restore 'text'
                    accent: '#00D1FF',   // [FIX] Restore 'accent' mapping to Cyan
                    gold: '#FFB800',     // [FIX] Restore 'gold' alias
                    cyan: '#00D1FF',     // [FIX] Restore 'cyan' alias
                    astral: '#A5A5C0',   // Light periwinkle grey (legibility)
                    null: '#ff3333',     // Danger Red
                    dim: '#CBD5E1',      // Slate-300 (global visibility boost)
                },
                // Living Sky landing palette ("night": Tailwind's built-in `sky` scale would collide)
                night: {
                    bg: '#05070f',
                    text: '#dfe6f5',
                    dim: '#97a0bd',
                    sun: '#ffce8a',
                    moon: '#e8ecf5',
                },
            },
            fontFamily: {
                mono: ['"Share Tech Mono"', 'monospace'],
                sans: ['"Michroma"', 'sans-serif'],
                // Living Sky landing: calm observatory type, system fonts only
                'sky-serif': ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
                'sky-mono': ['"SFMono-Regular"', '"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
            },
            backgroundImage: {
                'obsidian-radial': 'radial-gradient(circle at 50% 50%, #111419 0%, #050505 100%)',
                'solar-beam': 'linear-gradient(180deg, rgba(255, 184, 0, 0.2) 0%, rgba(255, 184, 0, 0) 100%)',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.5)',
            }
        },
    },
    plugins: [],
}
