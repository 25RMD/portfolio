import { useEffect, useRef } from 'react';

const BASE_SIZE = 160;
const MAX_SCALE = 1.6;
const LERP = 0.1;
const SCALE_LERP = 0.08;
const VELOCITY_SCALE_FACTOR = 0.015;

export default function InvertCursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const el = cursorRef.current;
        if (!el) return;

        let disposed = false;
        let animId = null;
        let inWindow = false;
        let overDark = false;

        const mouse = { x: 0, y: 0 };
        const pos = { x: 0, y: 0 };
        const prev = { x: 0, y: 0 };
        let currentScale = 1;
        let targetScale = 1;

        const isOverDarkSection = () => {
            const stack = document.elementsFromPoint(mouse.x, mouse.y);
            if (!stack || stack.length === 0) return false;

            for (const node of stack) {
                if (node === el) continue;
                if (node?.closest?.('[data-cursor-block]')) return false;
                if (node?.closest?.('[data-cursor-invert]')) return true;
            }

            return false;
        };

        const onMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if (!inWindow) {
                inWindow = true;
                pos.x = mouse.x;
                pos.y = mouse.y;
            }
        };

        const onMouseLeave = () => {
            inWindow = false;
            overDark = false;
            el.style.opacity = '0';
        };

        const onMouseEnter = () => {
            inWindow = true;
        };

        window.addEventListener('mousemove', onMouseMove);
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        el.style.opacity = '0';

        const animate = () => {
            if (disposed) return;
            animId = requestAnimationFrame(animate);

            if (!inWindow) return;

            const shouldShow = isOverDarkSection();
            if (shouldShow !== overDark) {
                overDark = shouldShow;
                el.style.opacity = shouldShow ? '1' : '0';
            }

            pos.x += (mouse.x - pos.x) * LERP;
            pos.y += (mouse.y - pos.y) * LERP;

            const dx = mouse.x - prev.x;
            const dy = mouse.y - prev.y;
            const velocity = Math.sqrt(dx * dx + dy * dy);
            prev.x = mouse.x;
            prev.y = mouse.y;

            targetScale = 1 + Math.min(velocity * VELOCITY_SCALE_FACTOR, MAX_SCALE - 1);
            currentScale += (targetScale - currentScale) * SCALE_LERP;

            el.style.transform = `translate(-50%, -50%) scale(${currentScale.toFixed(3)})`;
            el.style.left = pos.x + 'px';
            el.style.top = pos.y + 'px';
        };

        animate();

        return () => {
            disposed = true;
            if (animId) cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', onMouseMove);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                width: BASE_SIZE,
                height: BASE_SIZE,
                borderRadius: '50%',
                background: '#fff',
                mixBlendMode: 'difference',
                pointerEvents: 'none',
                zIndex: 99999,
                willChange: 'transform, left, top',
            }}
        />
    );
}
