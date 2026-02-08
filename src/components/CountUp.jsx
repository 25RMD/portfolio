import { useEffect, useRef, useState } from 'react';

export default function CountUp({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let rafId = null;
        let started = false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    started = true;
                    const startTime = performance.now();

                    const animate = (now) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * end));

                        if (progress < 1) {
                            rafId = requestAnimationFrame(animate);
                        }
                    };

                    rafId = requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => {
            observer.disconnect();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [end, duration]);

    return (
        <span ref={ref}>
            {count}{suffix}
        </span>
    );
}
