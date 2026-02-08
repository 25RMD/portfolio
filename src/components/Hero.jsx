import { useEffect, useRef, useCallback, useState } from 'react';
import AnimatedGrid from './AnimatedGrid';
import MagneticButton from './MagneticButton';

class Echo {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.opacity = 0.35;
        this.life = 1;
        this.decay = 0.02;
    }
    update() {
        this.life -= this.decay;
        this.opacity = this.life * 0.35;
        return this.life > 0;
    }
}

export default function Hero({ isLoading }) {
    const containerRef = useRef(null);
    const spotlightRef = useRef(null);
    const baseImageRef = useRef(null);
    const spotlightImageRef = useRef(null);
    const canvasRef = useRef(null);
    const textMaskRef = useRef(null);
    const textMaskInnerRef = useRef(null);
    const cursorRef = useRef(null);

    // Animation state refs
    const mousePos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    const spotPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    const cursorPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    const prevMousePos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    const echoes = useRef([]);
    const echoImg = useRef(null);
    const animationId = useRef(null);
    const touchTimeoutRef = useRef(null);
    const [showAltName, setShowAltName] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [touchActive, setTouchActive] = useState(false);
    const showContentRef = useRef(false);
    const isTouch = typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches;
    const showSpotlight = showContent && (!isTouch || touchActive);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 2000); // Wait for zoom out to complete
            return () => clearTimeout(timer);
        } else {
            // Defer reset to avoid synchronous state update during render
            const timer = setTimeout(() => setShowContent(false), 0);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    useEffect(() => {
        showContentRef.current = showContent;
    }, [showContent]);

    const getSpotlightSize = useCallback(() => 200, []);

    const getImageRect = useCallback(() => {
        if (!baseImageRef.current) return { left: 0, top: 0, width: 0, height: 0 };
        return baseImageRef.current.getBoundingClientRect();
    }, []);

    const updateSpotlightImagePosition = useCallback(() => {
        if (!spotlightImageRef.current || !baseImageRef.current) return;
        const rect = getImageRect();
        const spotlightSize = getSpotlightSize();
        const img = spotlightImageRef.current;
        const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.04 : 1.20;
        const scaledWidth = rect.width * scale;
        const scaledHeight = rect.height * scale;
        const offsetX = (scaledWidth - rect.width) / 2;
        const offsetY = (scaledHeight - rect.height) / 2;
        img.style.width = scaledWidth + 'px';
        img.style.height = scaledHeight + 'px';
        img.style.left = (rect.left - spotPos.current.x + spotlightSize / 2 - offsetX) + 'px';
        img.style.top = (rect.top - spotPos.current.y + spotlightSize / 2 - offsetY) + 'px';
    }, [getImageRect, getSpotlightSize]);

    // Name cycling effect
    useEffect(() => {
        const interval = setInterval(() => {
            setShowAltName(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        echoImg.current = new Image();
        echoImg.current.crossOrigin = "anonymous";
        echoImg.current.src = "/images/color.jpg";

        const resizeCanvas = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        const clearTouchTimeout = () => {
            if (touchTimeoutRef.current) {
                clearTimeout(touchTimeoutRef.current);
                touchTimeoutRef.current = null;
            }
        };
        const scheduleTouchIdle = () => {
            clearTouchTimeout();
            touchTimeoutRef.current = setTimeout(() => {
                setTouchActive(false);
            }, 1600);
        };
        const activateTouchSpotlight = (x, y, { snap = false } = {}) => {
            mousePos.current = { x, y };
            if (snap) {
                spotPos.current = { x, y };
                cursorPos.current = { x, y };
            }
            setTouchActive(true);
            scheduleTouchIdle();
        };
        const handleTouchMove = (e) => {
            if (!isTouch) e.preventDefault();
            if (!e.touches?.length) return;
            const { clientX, clientY } = e.touches[0];
            activateTouchSpotlight(clientX, clientY);
        };
        const handleTouchStart = (e) => {
            if (!e.touches?.length) return;
            const { clientX, clientY } = e.touches[0];
            activateTouchSpotlight(clientX, clientY, { snap: true });
        };
        const handleMouseLeave = () => {
            if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
            if (textMaskRef.current) textMaskRef.current.style.opacity = '0';
            if (cursorRef.current) cursorRef.current.style.opacity = '0';
        };
        const handleMouseEnter = () => {
            if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
            if (textMaskRef.current) textMaskRef.current.style.opacity = '1';
            if (cursorRef.current) cursorRef.current.style.opacity = '1';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        const animate = () => {
            const spotlightSize = getSpotlightSize();
            const ease = 0.12;

            spotPos.current.x += (mousePos.current.x - spotPos.current.x) * ease;
            spotPos.current.y += (mousePos.current.y - spotPos.current.y) * ease;
            cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.2;
            cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.2;

            if (cursorRef.current) {
                cursorRef.current.style.left = cursorPos.current.x + 'px';
                cursorRef.current.style.top = cursorPos.current.y + 'px';
            }

            if (cursorRef.current) {
                const elements = document.elementsFromPoint(mousePos.current.x, mousePos.current.y);
                const isInteractive = elements.some(el => el.closest('a, button, [role="button"], [data-cursor-hotspot]'));
                cursorRef.current.style.opacity = showContentRef.current && isInteractive ? '1' : '0';
            }

            const dx = mousePos.current.x - prevMousePos.current.x;
            const dy = mousePos.current.y - prevMousePos.current.y;
            const velocity = Math.sqrt(dx * dx + dy * dy);
            prevMousePos.current = { ...mousePos.current };

            if (spotlightRef.current) {
                spotlightRef.current.style.left = spotPos.current.x + 'px';
                spotlightRef.current.style.top = spotPos.current.y + 'px';
                spotlightRef.current.style.width = spotlightSize + 'px';
                spotlightRef.current.style.height = spotlightSize + 'px';
            }

            if (textMaskRef.current) {
                textMaskRef.current.style.left = spotPos.current.x + 'px';
                textMaskRef.current.style.top = spotPos.current.y + 'px';
                textMaskRef.current.style.width = spotlightSize + 'px';
                textMaskRef.current.style.height = spotlightSize + 'px';
            }
            if (textMaskInnerRef.current) {
                textMaskInnerRef.current.style.left = (-spotPos.current.x + spotlightSize / 2) + 'px';
                textMaskInnerRef.current.style.top = (-spotPos.current.y + spotlightSize / 2) + 'px';
            }

            updateSpotlightImagePosition();

            const cx = (mousePos.current.x / window.innerWidth - 0.5) * 2;
            const cy = (mousePos.current.y / window.innerHeight - 0.5) * 2;
            const parallaxStrength = 14;
            const parallaxScale = 1.04;

            if (baseImageRef.current) {
                baseImageRef.current.style.transform = `translate(${-cx * parallaxStrength}px, ${-cy * parallaxStrength}px) scale(${parallaxScale})`;
            }

            if (velocity > 8) {
                echoes.current.push(new Echo(spotPos.current.x, spotPos.current.y, spotlightSize * (0.6 + Math.random() * 0.3)));
            }

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const imgRect = getImageRect();

                echoes.current = echoes.current.filter(echo => {
                    echo.update();
                    if (echo.life <= 0) return false;

                    ctx.save();
                    ctx.globalAlpha = echo.opacity;
                    ctx.beginPath();
                    ctx.arc(echo.x, echo.y, echo.size / 2, 0, Math.PI * 2);
                    ctx.clip();

                    if (echoImg.current?.complete) {
                        ctx.filter = 'saturate(1.4) contrast(1.1) brightness(1.05)';
                        ctx.drawImage(echoImg.current, imgRect.left - cx * parallaxStrength, imgRect.top - cy * parallaxStrength, imgRect.width, imgRect.height);
                        ctx.filter = 'none';
                    }

                    ctx.restore();
                    return true;
                });
            }

            animationId.current = requestAnimationFrame(animate);
        };

        if (echoImg.current.complete) {
            animate();
        } else {
            echoImg.current.onload = animate;
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            clearTouchTimeout();
            if (animationId.current) {
                cancelAnimationFrame(animationId.current);
            }
        };
    }, [getSpotlightSize, getImageRect, updateSpotlightImagePosition]);

    return (
        <div
            ref={containerRef}
            id="hero-container"
            data-cursor-block
            className="fixed inset-0 w-full h-full overflow-hidden bg-white z-0"
        >
            {/* Base Image Layer (Grayscale) */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center z-0 overflow-hidden">
                <div 
                    className={`origin-bottom transition-transform duration-2000 ${!isLoading ? 'scale-100' : 'scale-125'}`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                >
                    <img
                        ref={baseImageRef}
                        src="/images/bw.jpg"
                        alt="Daniel Utho Portrait"
                        className="h-[90vh] w-auto object-cover object-bottom select-none transition-transform duration-800"
                        style={{
                            filter: 'grayscale(100%) brightness(1.05) contrast(1.1)',
                            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
                        }}
                    />
                </div>
            </div>

            {/* Animated Grid (over image, under UI) */}
            <AnimatedGrid />

            {/* Decorative Animated Elements */}
            <div className={`absolute inset-0 z-10 pointer-events-none overflow-hidden transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                {/* Rotating ring */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-black/8"
                    style={{ animation: 'spin-slow 25s linear infinite' }}
                />
                {/* Counter-rotating dashed ring */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-dashed border-black/5"
                    style={{ animation: 'spin-reverse-slow 35s linear infinite' }}
                />
                {/* Orbiting dot */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[380px] md:h-[380px]"
                    style={{ animation: 'spin-slow 10s linear infinite' }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black/25 rounded-full" />
                </div>
                {/* Second orbiting dot - opposite phase */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[420px] md:h-[420px]"
                    style={{ animation: 'spin-reverse-slow 14s linear infinite' }}
                >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-black/20 rounded-full" />
                </div>
                {/* Rotating cross near name */}
                <div
                    className="absolute top-1/2 -mt-3 left-64 md:left-96 w-6 h-6 opacity-60"
                    style={{ animation: 'spin-slow 20s linear infinite' }}
                >
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black -translate-y-1/2" />
                    <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black -translate-x-1/2" />
                </div>
                {/* Floating diamond */}
                <div
                    className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 border border-black/10 rotate-45"
                    style={{ animation: 'float 8s ease-in-out infinite' }}
                />
                {/* Pulsing ring */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full border border-black/6"
                    style={{ animation: 'pulse-subtle 4s ease-in-out infinite' }}
                />
            </div>

            {/* Canvas for echoes - hidden on touch */}
            <div className={`absolute inset-0 z-20 pointer-events-none ${isTouch ? 'hidden' : ''}`}>
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            {/* Spotlight Circle (reveals color image) - hidden on touch */}
            <div
                ref={spotlightRef}
                className={`fixed w-[200px] h-[200px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 overflow-hidden transition-opacity duration-1000 ${showSpotlight ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: '200px', height: '200px', background: '#fff' }}
            >
                <img
                    ref={spotlightImageRef}
                    src="/images/color.jpg"
                    alt="Daniel Utho Alternate"
                    className="absolute max-w-none max-h-none object-cover select-none"
                    style={{ filter: 'saturate(1.4) contrast(1.1) brightness(1.05)' }}
                />
            </div>

            {/* Name - Top Left (always visible) */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 z-60 pointer-events-auto">
                <div className="relative">
                    <h1
                        className={`font-syne text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.85] transition-opacity duration-1000 ease-in-out text-[#111] ${showAltName ? 'opacity-0' : 'opacity-100'}`}
                    >
                        <span className="block">DANIEL</span>
                        <span className="block mt-1">UTHO</span>
                    </h1>
                    <h1
                        className={`font-cursive text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-normal leading-[0.85] absolute inset-0 transition-opacity duration-1000 ease-in-out text-[#111] ${showAltName ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <span className="block pt-2">25RMD</span>
                    </h1>
                </div>
            </div>

            {/* UI Layer */}
            <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                {/* Mobile Menu Button - Top Right (visible only on mobile) */}
                <button
                    onClick={() => setMenuOpen(true)}
                    className="absolute top-8 right-8 z-20 pointer-events-auto flex md:hidden flex-col justify-center items-center gap-[5px] w-10 h-10 bg-transparent border-none cursor-pointer"
                    aria-label="Open menu"
                >
                    <span className="block w-6 h-[2px] bg-[#111]" />
                    <span className="block w-6 h-[2px] bg-[#111]" />
                    <span className="block w-4 h-[2px] bg-[#111] self-end" />
                </button>

                {/* Navigation - Top Right (hidden on mobile) */}
                <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20 pointer-events-auto hidden md:flex items-center gap-4 sm:gap-8 md:gap-12">
                    <MagneticButton strength={0.4}>
                        <button
                            data-cursor-hotspot
                            onClick={() => {
                                history.replaceState(null, '', window.location.pathname);
                                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="relative font-space text-xs md:text-sm font-bold tracking-[0.2em] transition-all duration-300 bg-transparent border-none cursor-pointer nav-underline"
                            style={{ color: '#111' }}
                        >
                            ABOUT
                        </button>
                    </MagneticButton>
                    <MagneticButton strength={0.4}>
                        <button
                            data-cursor-hotspot
                            onClick={() => {
                                history.replaceState(null, '', window.location.pathname);
                                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="relative font-space text-xs md:text-sm font-bold tracking-[0.2em] transition-all duration-300 bg-transparent border-none cursor-pointer nav-underline"
                            style={{ color: '#111' }}
                        >
                            PROJECTS
                        </button>
                    </MagneticButton>
                    <MagneticButton strength={0.4}>
                        <button
                            data-cursor-hotspot
                            onClick={() => {
                                history.replaceState(null, '', window.location.pathname);
                                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="relative font-space text-xs md:text-sm font-bold tracking-[0.2em] transition-all duration-300 bg-transparent border-none cursor-pointer nav-underline"
                            style={{ color: '#111' }}
                        >
                            CONTACT
                        </button>
                    </MagneticButton>
                </div>

                {/* Bottom Row - Tagline & Social Icons */}
                <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-20 flex items-center justify-between pointer-events-auto">
                    {/* Tagline - Bottom Left */}
                    <p
                        className="font-space text-xs tracking-[0.2em] opacity-60 font-bold text-[#111]"
                    >
                        SOFTWARE DEVELOPER
                    </p>

                    {/* Social Icons - Bottom Right */}
                    <div className="flex items-center gap-5 md:gap-6 cursor-pointer">
                        {/* X (Twitter) */}
                        <MagneticButton strength={0.5}>
                        <a
                            data-cursor-hotspot
                            href="https://x.com/r25aum"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all duration-200 hover:scale-110 cursor-pointer p-2 text-black"
                            aria-label="X"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        </MagneticButton>
                        {/* Instagram */}
                        <MagneticButton strength={0.5}>
                        <a
                            data-cursor-hotspot
                            href="https://instagram.com/r25aum"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all duration-200 hover:scale-110 cursor-pointer p-2 text-black"
                            aria-label="Instagram"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        </a>
                        </MagneticButton>
                        {/* GitHub */}
                        <MagneticButton strength={0.5}>
                        <a
                            data-cursor-hotspot
                            href="https://github.com/25rmd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all duration-200 hover:scale-110 cursor-pointer p-2 text-black"
                            aria-label="GitHub"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        </MagneticButton>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-500 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Close Button */}
                <button
                    onClick={() => setMenuOpen(false)}
                    className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer"
                    aria-label="Close menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <nav className="flex flex-col items-center gap-10">
                    {['about', 'projects', 'contact'].map((section) => (
                        <button
                            key={section}
                            onClick={() => {
                                setMenuOpen(false);
                                setTimeout(() => {
                                    history.replaceState(null, '', window.location.pathname);
                                    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            }}
                            className="font-space text-2xl font-bold tracking-[0.2em] bg-transparent border-none cursor-pointer text-[#111] transition-opacity duration-200 hover:opacity-60"
                        >
                            {section.toUpperCase()}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Text Mask Layer (white text revealed inside spotlight circle) - hidden on touch */}
            <div
                ref={textMaskRef}
                className={`fixed rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 overflow-hidden transition-opacity duration-1000 ${showSpotlight ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: '200px', height: '200px' }}
            >
                <div
                    ref={textMaskInnerRef}
                    className="absolute"
                    style={{ width: '100vw', height: '100vh' }}
                >
                    {/* Name - Top Left */}
                    <div className="absolute top-8 left-8 md:top-12 md:left-12">
                        <div className="relative">
                            <h1
                                className={`font-syne text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.85] transition-opacity duration-1000 ease-in-out ${showAltName ? 'opacity-0' : 'opacity-100'}`}
                                style={{ color: '#fff' }}
                            >
                                <span className="block">DANIEL</span>
                                <span className="block mt-1">UTHO</span>
                            </h1>
                            <h1
                                className={`font-cursive text-6xl md:text-8xl lg:text-9xl tracking-normal leading-[0.85] absolute inset-0 transition-opacity duration-1000 ease-in-out ${showAltName ? 'opacity-100' : 'opacity-0'}`}
                                style={{ color: '#fff' }}
                            >
                                <span className="block pt-2">25RMD</span>
                            </h1>
                        </div>
                    </div>

                    {/* Navigation - Top Right */}
                    <div className="absolute top-8 right-8 md:top-12 md:right-12 hidden md:flex items-center gap-4 sm:gap-8 md:gap-12">
                        <span
                            className="font-space text-xs md:text-sm font-bold tracking-[0.2em]"
                            style={{ color: '#fff' }}
                        >
                            ABOUT
                        </span>
                        <span
                            className="font-space text-xs md:text-sm font-bold tracking-[0.2em]"
                            style={{ color: '#fff' }}
                        >
                            PROJECTS
                        </span>
                        <span
                            className="font-space text-xs md:text-sm font-bold tracking-[0.2em]"
                            style={{ color: '#fff' }}
                        >
                            CONTACT
                        </span>
                    </div>

                    {/* Bottom Row - Tagline & Social Icons */}
                    <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 hidden md:flex items-center justify-between">
                        {/* Tagline - Bottom Left */}
                        <p
                            className="font-space text-xs tracking-[0.2em] opacity-60 font-bold"
                            style={{ color: '#111' }}
                        >
                            SOFTWARE DEVELOPER
                        </p>

                        {/* Social Icons - Bottom Right */}
                        <div className="flex items-center gap-5 md:gap-6" style={{ color: '#fff' }}>
                            {/* X (Twitter) */}
                            <a
                                data-cursor-hotspot
                                href="https://x.com/r25aum"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all duration-200 hover:scale-110"
                                style={{ color: '#fff' }}
                                aria-label="X"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a
                                data-cursor-hotspot
                                href="https://instagram.com/r25aum"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all duration-200 hover:scale-110"
                                style={{ color: '#fff' }}
                                aria-label="Instagram"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                            {/* GitHub */}
                            <a
                                data-cursor-hotspot
                                href="https://github.com/25rmd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all duration-200 hover:scale-110"
                                style={{ color: '#fff' }}
                                aria-label="GitHub"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cursor - hidden on touch */}
            <div
                ref={cursorRef}
                className={`fixed w-5 h-5 rounded-full border-2 border-black -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100] mix-blend-difference transition-[width,height,border-color] duration-300 ${isTouch ? 'hidden' : ''}`}
            />
        </div>
    );
}
