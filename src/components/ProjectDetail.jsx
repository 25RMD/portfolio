import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectBySlug } from '../data/projects';
import { getLenis } from '../hooks/useLocomotiveScroll';

export default function ProjectDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const project = getProjectBySlug(slug);

    const handleClose = () => {
        sessionStorage.removeItem('homeScrollY');
        sessionStorage.setItem('homeScrollTarget', 'projects');
        navigate({ pathname: '/', hash: '#projects' });
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        // Reset Lenis scroll position so it doesn't fight with native scroll
        const lenis = getLenis();
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [slug]);

    if (!project) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-syne text-4xl font-bold mb-4">Project not found</h1>
                    <button
                        onClick={handleClose}
                        className="font-space text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        &larr; Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-black text-white relative"
            data-cursor-invert
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

            <div className="relative z-10 px-4 py-5 sm:p-8 md:p-20">
                {/* Back Button */}
                <button
                    onClick={handleClose}
                    className="fixed top-5 right-5 sm:top-8 sm:right-8 md:top-12 md:right-12 z-50 font-space text-[10px] sm:text-xs md:text-sm font-bold tracking-widest hover:opacity-70 transition-opacity mix-blend-difference cursor-pointer"
                    style={{ color: '#fff' }}
                >
                    CLOSE
                </button>

                <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-16 md:gap-20 pt-10 sm:pt-20">
                    {/* Header */}
                    <div className="flex flex-col gap-6">
                        <h1 className="font-syne text-2xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.85] uppercase wrap-break-word">
                            {project.title}
                        </h1>
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            {project.tags.map(tag => (
                                <span key={tag} className="font-space text-[10px] sm:text-xs border border-white/20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest opacity-60">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-12">
                        <p className="font-space text-sm sm:text-lg md:text-2xl leading-relaxed opacity-90">
                            {project.description}
                        </p>
                        <div className="flex flex-col gap-5 sm:gap-8">
                            <div>
                                <h3 className="font-space text-[10px] sm:text-xs font-bold tracking-widest opacity-50 mb-1 sm:mb-2">ROLE</h3>
                                <p className="font-space text-base sm:text-lg">{project.role}</p>
                            </div>
                            {project.link && (
                                <div>
                                    <h3 className="font-space text-[10px] sm:text-xs font-bold tracking-widest opacity-50 mb-1 sm:mb-2">LINK</h3>
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-space text-base sm:text-lg border-b border-white hover:opacity-70 transition-opacity"
                                    >
                                        Visit Site
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Screenshots */}
                    <div className="flex flex-col gap-8 sm:gap-16 md:gap-24">
                        {/* Website Section */}
                        {project.websiteImage && (
                            <div className="flex flex-col gap-4 sm:gap-8">
                                <h2 className="font-syne text-xl sm:text-3xl md:text-4xl font-bold">Web Platform</h2>
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
                            </div>
                        )}

                        {/* Mobile App Section */}
                        {project.appImage && (
                            <div className="flex flex-col gap-4 sm:gap-8">
                                <h2 className="font-syne text-xl sm:text-3xl md:text-4xl font-bold">Mobile Application</h2>
                                <div className="flex justify-center gap-3 sm:gap-8 flex-wrap">
                                    {(Array.isArray(project.appImage) ? project.appImage : [project.appImage]).map((src, i) => (
                                        <div key={i} className="w-full max-w-[160px] sm:max-w-[280px] md:max-w-sm aspect-[9/19.5] bg-white/5 rounded-3xl sm:rounded-4xl overflow-hidden relative group border border-white/20 shadow-2xl">
                                            <img
                                                src={src}
                                                alt={`${project.title} App ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {/* Placeholder if image fails */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 -z-10">
                                                <span className="font-space opacity-30">App Screenshot</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
