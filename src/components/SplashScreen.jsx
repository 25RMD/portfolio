import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // 2 seconds total load time
        const interval = 20;
        const steps = duration / interval;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setCount((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return next;
            });
        }, interval);

        const timeout = setTimeout(() => {
            onComplete();
        }, duration + 500); // minimal delay after 100%

        return () => {
            clearInterval(timer);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-9999 bg-black text-white flex flex-col items-center justify-center overflow-hidden"
            initial={{ y: 0 }}
            data-cursor-invert
            exit={{ 
                y: '-100%',
                transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
            }}
        >
            <motion.div 
                className="flex flex-col items-center justify-center w-full relative"
                initial={{ opacity: 1 }}
                exit={{ 
                    opacity: 0,
                    y: -100,
                    transition: { duration: 0.4, ease: "easeInOut" }
                }}
            >
                <div className="relative">
                    {/* Large Percentage */}
                    <span className="font-syne text-[15vw] md:text-[12vw] font-bold leading-none tracking-tighter">
                        {Math.round(count)}
                    </span>
                    <span className="font-syne text-4xl md:text-6xl align-top absolute -right-8 md:-right-12 top-2 md:top-4">%</span>
                </div>

                {/* Loading Status Text */}
                <div className="mt-8 overflow-hidden h-8 flex items-center">
                    <motion.p 
                        className="font-space text-sm md:text-base uppercase tracking-widest opacity-60"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.6 }}
                        transition={{ delay: 0.2 }}
                    >
                        Loading Experience
                    </motion.p>
                </div>
            </motion.div>
            
            {/* Progress Bar Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                <motion.div 
                    className="h-full bg-white"
                    style={{ width: `${count}%` }}
                    exit={{ opacity: 0 }}
                />
            </div>
        </motion.div>
    );
}
