import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// Lenis-style lerp for smooth interpolation
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export default function SplashScreen({ onComplete }) {
    const [displayCount, setDisplayCount] = useState(0);
    const targetRef = useRef(0);
    const currentRef = useRef(0);
    const startTimeRef = useRef(null);
    const rafRef = useRef(null);
    const finishedRef = useRef(false);

    const DURATION = 2500;
    const LERP_FACTOR = 0.08;

    const handleComplete = useCallback(() => {
        if (!finishedRef.current) {
            finishedRef.current = true;
            setTimeout(onComplete, 800);
        }
    }, [onComplete]);

    useEffect(() => {
        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;

            targetRef.current = Math.min((elapsed / DURATION) * 100, 100);
            currentRef.current = lerp(currentRef.current, targetRef.current, LERP_FACTOR);

            if (targetRef.current >= 100 && currentRef.current > 99.5) {
                currentRef.current = 100;
            }

            const rounded = Math.round(currentRef.current);
            setDisplayCount(rounded);

            if (rounded >= 100) {
                setTimeout(handleComplete, 400);
                return;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [handleComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-9999 bg-black text-white flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ 
                y: '-100%',
                transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
            }}
            data-cursor-invert
        >
            <div className="overflow-hidden flex items-baseline">
                <motion.span 
                    className="font-syne text-[20vw] md:text-[15vw] font-extrabold leading-none tracking-tighter"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {displayCount.toString().padStart(2, '0')}
                </motion.span>
                <motion.span 
                    className="font-syne text-4xl md:text-6xl font-light ml-2 opacity-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.5 }}
                >
                    %
                </motion.span>
            </div>
        </motion.div>
    );
}
