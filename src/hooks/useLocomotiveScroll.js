import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';

let _instance = null;

export function getLocomotiveScroll() {
  return _instance;
}

export default function useLocomotiveScroll() {
  const scrollRef = useRef(null);

  useEffect(() => {
    _instance = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.8,
      },
    });
    scrollRef.current = _instance;

    return () => {
      if (scrollRef.current) {
        scrollRef.current.destroy();
        scrollRef.current = null;
        _instance = null;
      }
    };
  }, []);

  return scrollRef;
}
