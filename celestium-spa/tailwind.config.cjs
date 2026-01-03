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
                    dim: '#333333'
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
            }
        },
    },
    plugins: [],
}
