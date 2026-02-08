import { useEffect, useRef } from 'react';

const LINE_COUNT = 20;
const LINE_SEGMENTS = 120;
const LINE_WIDTH = 1.2;
const LINE_OPACITY = 0.06;
const WAVE_AMP = 14;
const CURSOR_RADIUS = 300;
const CURSOR_PUSH = 50;
const PULSE_SPEED = 1.8;

export default function AnimatedGrid({ color = '0, 0, 0' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio, 2);
        let width = window.innerWidth;
        let height = window.innerHeight;
        let animId = null;
        let disposed = false;
        let time = 0;

        const mouse = { x: -9999, y: -9999 };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const onMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouseMove);

        const animate = () => {
            if (disposed) return;
            animId = requestAnimationFrame(animate);
            time += 0.016;

            ctx.clearRect(0, 0, width, height);

            const spacing = height / (LINE_COUNT + 1);

            for (let i = 0; i < LINE_COUNT; i++) {
                const baseY = spacing * (i + 1);
                const linePhase = i * 0.6;

                // Pulse: a bright wave that sweeps across each line
                const pulseCenter = ((time * PULSE_SPEED + linePhase * 0.3) % 4) * width - width * 0.5;
                const pulseWidth = width * 0.35;

                ctx.beginPath();

                for (let s = 0; s <= LINE_SEGMENTS; s++) {
                    const t = s / LINE_SEGMENTS;
                    const x = t * width;

                    // Multi-frequency wave
                    const wave1 = Math.sin(t * Math.PI * 3 + time * 1.2 + linePhase) * WAVE_AMP;
                    const wave2 = Math.sin(t * Math.PI * 5 - time * 0.8 + linePhase * 1.5) * WAVE_AMP * 0.4;
                    const wave3 = Math.sin(t * Math.PI * 1.5 + time * 0.5 + linePhase * 0.7) * WAVE_AMP * 0.6;
                    let y = baseY + wave1 + wave2 + wave3;

                    // Cursor displacement
                    const dx = x - mouse.x;
                    const dy = y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CURSOR_RADIUS && dist > 0) {
                        const factor = 1 - dist / CURSOR_RADIUS;
                        const eased = factor * factor * factor;
                        y += (dy / dist) * eased * CURSOR_PUSH;
                    }

                    if (s === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                // Pulse brightness along the line
                const pulseDist = Math.abs(width * 0.5 - pulseCenter);
                const pulseAlpha = Math.max(0, 1 - pulseDist / pulseWidth) * 0.15;
                const alpha = LINE_OPACITY + pulseAlpha;

                ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                ctx.lineWidth = LINE_WIDTH;
                ctx.stroke();

                // Draw the pulse highlight as a second pass with stronger opacity
                ctx.beginPath();
                for (let s = 0; s <= LINE_SEGMENTS; s++) {
                    const t = s / LINE_SEGMENTS;
                    const x = t * width;

                    const wave1 = Math.sin(t * Math.PI * 3 + time * 1.2 + linePhase) * WAVE_AMP;
                    const wave2 = Math.sin(t * Math.PI * 5 - time * 0.8 + linePhase * 1.5) * WAVE_AMP * 0.4;
                    const wave3 = Math.sin(t * Math.PI * 1.5 + time * 0.5 + linePhase * 0.7) * WAVE_AMP * 0.6;
                    let y = baseY + wave1 + wave2 + wave3;

                    const dx = x - mouse.x;
                    const dy = y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CURSOR_RADIUS && dist > 0) {
                        const factor = 1 - dist / CURSOR_RADIUS;
                        const eased = factor * factor * factor;
                        y += (dy / dist) * eased * CURSOR_PUSH;
                    }

                    // Only draw within pulse region
                    const distFromPulse = Math.abs(x - pulseCenter);
                    if (distFromPulse < pulseWidth) {
                        const pFactor = 1 - distFromPulse / pulseWidth;
                        const pEased = pFactor * pFactor;
                        if (s === 0 || Math.abs(x - LINE_SEGMENTS * (s - 1) / LINE_SEGMENTS * width) > pulseWidth) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                        ctx.lineWidth = LINE_WIDTH + pEased * 1.5;
                    }
                }
                ctx.strokeStyle = `rgba(${color}, 0.15)`;
                ctx.stroke();
            }
        };

        animate();

        return () => {
            disposed = true;
            if (animId) cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [color]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 2,
            }}
        />
    );
}
