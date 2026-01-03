PHASE 2 UPGRADE PACKAGE: "Neon & Dust"
Here are three specific upgrades to drop into your code to take this from "Console App" to "Sci-Fi HUD."

1. The Typography Upgrade (Google Fonts)
Your current font is standard. We need something that looks like it was etched by a laser.

Recommended: Share Tech Mono (Classic HUD) or Rajdhani (Sleek/Modern).

Update src/app/layout.tsx (or index.html):

HTML

<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
Update celestium.module.css:

CSS

.container {
  /* ... existing styles ... */
  font-family: 'Share Tech Mono', monospace; /* The font of the future */
}

/* Make the big numbers feel weightier */
.godString {
  font-size: 2.2rem; 
  text-shadow: 0 0 15px rgba(0, 255, 157, 0.4); /* Stronger diffusion */
}
2. The "Comet Tail" Ring Gradient
Right now, your rings are solid flat colors. Let's make them fade out like a comet tail, so the leading edge is bright and the trailing edge vanishes.

Update your SVG definition in CelestiumInterface.tsx:

Add a <defs> section inside your <svg> tag to create gradients:

TypeScript

<defs>
  {/* Solar Gradient: Green to Transparent */}
  <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="rgba(0, 255, 157, 0)" />
    <stop offset="100%" stopColor="#00ff9d" />
  </linearGradient>
  
  {/* Time Gradient: White to Transparent */}
  <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
    <stop offset="100%" stopColor="#ffffff" />
  </linearGradient>
</defs>
Apply it to the circles: Instead of stroke="#00ff9d", use stroke="url(#solarGradient)". Note: You might need to rotate the gradient or the circle transform to align the "bright" part with the "head" of the progress bar, but often just switching to a gradient gives it that immediate "glass" look.

3. The Literal Moon (No More Numbers)
The number "15" is accurate, but boring. Let's render the actual shadow of the moon.

Replace the center <circle> and text with this dynamic component:

TypeScript

{/* Inside the SVG, replacing the center "15" text */}
<mask id="moonMask">
  <rect x="0" y="0" width="100" height="100" fill="white" />
  {/* The shadow moves based on phase */}
  <circle cx={150 + ((parseInt(data.lunarPhase) - 15) * 2)} cy="150" r="25" fill="black" />
</mask>

{/* The Moon Body */}
<circle cx="150" cy="150" r="25" fill="#e0e0e0" mask="url(#moonMask)" />
(Note: This is a rough approximation. For a perfect moon render, we usually swap 30 distinct SVG icons, but this mask trick gives you a moving shadow effect).

4. Interactive "Glitch" (The Red Pill)
You mentioned the "Null Interval." Let's add a hidden trigger to simulate it, so you can see the Red Alert mode without waiting for March 2026.

In CelestiumInterface.tsx: Add a hidden click handler to the "175k" text.

TypeScript

const toggleSimulation = () => {
   // Quick hack to force NULL state for 5 seconds to test UI
   const originalStatus = data?.status;
   // logic to override state to "NULL"
   alert("SIMULATING NULL INTERVAL: SYSTEM RESET PENDING...");
};