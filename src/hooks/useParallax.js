import { useEffect, useRef } from 'react';

/**
 * Applies scroll-driven parallax transforms to elements with [data-parallax] attribute.
 * Usage: add data-parallax="0.1" to any element (value = speed factor, negative = opposite direction).
 */
export default function useParallax() {
    const elementsRef = useRef([]);

    useEffect(() => {
        const collect = () => {
            elementsRef.current = Array.from(document.querySelectorAll('[data-parallax]'));
        };
        collect();

        const mo = new MutationObserver(collect);
        mo.observe(document.body, { childList: true, subtree: true });

        let rafId = null;

        const update = () => {
            elementsRef.current.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0;
                const rect = el.getBoundingClientRect();
                const viewH = window.innerHeight;
                const center = rect.top + rect.height / 2;
                const offset = (center - viewH / 2) * speed;
                el.style.transform = `translateY(${offset}px)`;
            });

            rafId = requestAnimationFrame(update);
        };

        rafId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(rafId);
            mo.disconnect();
        };
    }, []);
}
