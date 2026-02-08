import { useEffect, useRef, useState } from 'react';

export default function SplitText({ children, className = '', delay = 0, staggerDelay = 0.035 }) {
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const text = typeof children === 'string' ? children : '';
    const words = text.split(' ');

    return (
        <span ref={containerRef} className={className}>
            {words.map((word, wi) => {
                const charOffset = words.slice(0, wi).reduce((sum, w) => sum + w.length, 0);
                return (
                    <span key={wi} className="inline-block whitespace-nowrap">
                        {word.split('').map((char, ci) => {
                            const globalIndex = charOffset + ci;
                            return (
                                <span
                                    key={ci}
                                    className="inline-block transition-all duration-700"
                                    style={{
                                        transitionDelay: isVisible ? `${delay + globalIndex * staggerDelay}s` : '0s',
                                        transform: isVisible ? 'translateY(0) rotateX(0)' : 'translateY(100%) rotateX(90deg)',
                                        opacity: isVisible ? 1 : 0,
                                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                >
                                    {char}
                                </span>
                            );
                        })}
                        {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                    </span>
                );
            })}
        </span>
    );
}
