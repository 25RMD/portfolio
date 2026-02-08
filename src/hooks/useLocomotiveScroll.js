import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

let _instance = null;

export function getLenis() {
  return _instance;
}

// Keep old name as alias for backward compat
export const getLocomotiveScroll = getLenis;

export default function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });
    _instance = lenis;
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        _instance = null;
      }
    };
  }, []);

  return lenisRef;
}
