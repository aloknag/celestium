import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { SkyScene } from '../components/Sky/SkyScene';

const noop = () => {};

export function Landing(): ReactElement {
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
      <SkyScene mode="now" reduced={false} onSnapshot={noop} />
      {/* temporary entry point until the overlay lands in Task 4 */}
      <Link
        to="/cosmos"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-night-dim hover:text-night-text"
      >
        Open the instrument →
      </Link>
    </div>
  );
}
