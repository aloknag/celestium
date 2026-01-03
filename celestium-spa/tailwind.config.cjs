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
                    text: '#e0e0e0',
                    accent: '#00ff9d', // Neon green/cyan
                    null: '#ff3333',   // Red alert
                    dim: '#666666'
                }
            },
            fontFamily: {
                mono: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
            }
        },
    },
    plugins: [],
}
