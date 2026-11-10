import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useReducedMotion } from 'framer-motion';
import { SkyOverlay } from '../components/Sky/SkyOverlay';
import { SkyScene } from '../components/Sky/SkyScene';
import type { SkySnapshot } from '../lib/sky';
import type { SkyMode } from '../lib/skyClock';

export function Landing(): ReactElement {
  const [mode, setMode] = useState<SkyMode>('now');
  const [snapshot, setSnapshot] = useState<SkySnapshot | null>(null);
  const reduced = useReducedMotion() ?? false;

  // The rhythm controls are hidden on phones and short windows: never leave the sky
  // simulated or paused once there is no way back to NOW.
  useEffect(() => {
    const withControls = window.matchMedia('(min-width: 768px) and (min-height: 480px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setMode('now');
    };
    withControls.addEventListener('change', onChange);
    return () => withControls.removeEventListener('change', onChange);
  }, []);

  // The HUD's grain, scanlines and header flicker are switched off by index.css
  // while this attribute is present.
  useEffect(() => {
    document.documentElement.dataset.theme = 'sky';
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-night-bg font-sky-serif text-night-text">
      <SkyScene mode={mode} reduced={reduced} onSnapshot={setSnapshot} />
      <SkyOverlay snapshot={snapshot} mode={mode} onModeChange={setMode} />
    </div>
  );
}
