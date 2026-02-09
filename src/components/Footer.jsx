export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer
            data-cursor-invert
            className="relative w-full bg-black text-white z-10 py-6 sm:py-8 px-4 sm:px-6 md:px-12 border-t border-white/10"
        >
            <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-space text-xs tracking-widest uppercase opacity-40">
                    &copy; {new Date().getFullYear()} Daniel Utho
                </p>

                <button
                    onClick={scrollToTop}
                    className="group flex items-center gap-2 font-space text-xs tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity duration-300 bg-transparent border-none cursor-pointer"
                    style={{ color: '#fff' }}
                >
                    <span>Back to top</span>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover:-translate-y-1"
                    >
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                    </svg>
                </button>
            </div>
        </footer>
    );
}
