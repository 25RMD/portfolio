import { motion } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import { getLocomotiveScroll } from '../hooks/useLocomotiveScroll';

export default function ProjectDetail({ project, onClose }) {
    const cleanupRef = useRef(null);

    const attachRef = useCallback((node) => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }

        if (!node) return;

        const stopProp = (e) => e.stopPropagation();
        node.addEventListener('wheel', stopProp, { passive: false });
        node.addEventListener('touchstart', stopProp, { passive: false });
        node.addEventListener('touchmove', stopProp, { passive: false });

        cleanupRef.current = () => {
            node.removeEventListener('wheel', stopProp);
            node.removeEventListener('touchstart', stopProp);
            node.removeEventListener('touchmove', stopProp);
        };
    }, []);

    useEffect(() => {
        const loco = getLocomotiveScroll();
        loco?.stop?.();
        loco?.lenis?.stop?.();

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            loco?.start?.();
            loco?.lenis?.start?.();
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, []);

    if (!project) return null;

    return (
        <motion.div
            ref={attachRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-cursor-invert
            className="fixed inset-0 z-9999 bg-black text-white overflow-y-scroll overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* Decorative Background Elements */}
            <div
                className="fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-dashed border-white/20 pointer-events-none"
                style={{ animation: 'spin-slow 60s linear infinite' }}
            />
            <div
                className="fixed bottom-20 right-10 pointer-events-none"
                style={{ animation: 'float 7s ease-in-out infinite' }}
            >
                <div className="w-32 h-32 border border-white/20 rotate-12" />
            </div>

            <div className="min-h-screen relative z-10 p-8 md:p-20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-8 right-8 md:top-12 md:right-12 z-50 font-space text-xs md:text-sm font-bold tracking-widest hover:opacity-70 transition-opacity mix-blend-difference"
                    style={{ color: '#fff' }}
                >
                    CLOSE
                </button>

                <div className="max-w-7xl mx-auto flex flex-col gap-20 pt-20">
                    {/* Header */}
                    <div className="flex flex-col gap-6">
                        <motion.h1
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="font-syne text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.85] uppercase wrap-break-word"
                        >
                            {project.title}
                        </motion.h1>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-wrap gap-4"
                        >
                            {project.tags.map(tag => (
                                <span key={tag} className="font-space text-xs border border-white/20 px-3 py-1 rounded-full uppercase tracking-widest opacity-60">
                                    {tag}
                                </span>
                            ))}
                        </motion.div>
                    </div>

                    {/* Description */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24"
                    >
                        <p className="font-space text-xl md:text-2xl leading-relaxed opacity-90">
                            {project.description}
                        </p>
                        <div className="flex flex-col gap-8">
                            <div>
                                <h3 className="font-space text-xs font-bold tracking-widest opacity-50 mb-2">ROLE</h3>
                                <p className="font-space text-lg">{project.role}</p>
                            </div>
                            <div>
                                <h3 className="font-space text-xs font-bold tracking-widest opacity-50 mb-2">YEAR</h3>
                                <p className="font-space text-lg">{project.year}</p>
                            </div>
                            {project.link && (
                                <div>
                                    <h3 className="font-space text-xs font-bold tracking-widest opacity-50 mb-2">LINK</h3>
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-space text-lg border-b border-white hover:opacity-70 transition-opacity"
                                    >
                                        Visit Site
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Screenshots */}
                    <div className="flex flex-col gap-24">
                        {/* Website Section */}
                        {project.websiteImage && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col gap-8"
                            >
                                <h2 className="font-syne text-4xl font-bold">Web Platform</h2>
                                <div className="w-full aspect-video bg-white/5 rounded-lg overflow-hidden relative group border border-white/20">
                                    <img
                                        src={project.websiteImage}
                                        alt={`${project.title} Website`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Placeholder if image fails */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 -z-10">
                                        <span className="font-space opacity-30">Website Screenshot</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Mobile App Section */}
                        {project.appImage && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col gap-8"
                            >
                                <h2 className="font-syne text-4xl font-bold">Mobile Application</h2>
                                <div className="w-full max-w-sm mx-auto aspect-[9/19.5] bg-white/5 rounded-4xl overflow-hidden relative group border border-white/20 shadow-2xl">
                                    <img
                                        src={project.appImage}
                                        alt={`${project.title} App`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Placeholder if image fails */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 -z-10">
                                        <span className="font-space opacity-30">App Screenshot</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
