import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
    const barRef = useRef(null);

    useEffect(() => {
        const el = barRef.current;
        if (!el) return;

        let rafId = null;

        const update = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? scrollTop / docHeight : 0;
            el.style.transform = `scaleX(${progress})`;
            rafId = requestAnimationFrame(update);
        };

        rafId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return <div ref={barRef} className="scroll-progress w-full" />;
}
