import { useState } from 'react';

export default function ProjectGrid({ projects, onProjectClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {projects.map((project, index) => (
                <button
                    key={project.title}
                    onClick={() => onProjectClick(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`group relative text-left bg-transparent border-none p-0 cursor-pointer w-full reveal reveal-delay-${(index % 3) + 1}`}
                    data-scroll
                >
                    {/* Image Container */}
                    <div className="relative w-full aspect-4/5 overflow-hidden rounded-sm bg-white/5 mb-5">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            style={{
                                filter: hoveredIndex !== null && hoveredIndex !== index
                                    ? 'grayscale(100%) brightness(0.4)'
                                    : 'grayscale(0%) brightness(1)',
                                transition: 'filter 0.6s ease, transform 0.7s ease',
                            }}
                        />
                        {/* Hover Overlay */}
                        <div
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-end p-6"
                        >
                            <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.slice(0, 3).map(tag => (
                                        <span
                                            key={tag}
                                            className="font-space text-[10px] tracking-widest uppercase px-2 py-1 border border-white/40 rounded-full text-white/80"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between">
                            <h3
                                className="font-syne text-xl md:text-2xl font-bold tracking-tight text-white transition-opacity duration-500"
                                style={{
                                    opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.3 : 1,
                                }}
                            >
                                {project.title}
                            </h3>
                            <span
                                className="font-space text-xs tracking-widest text-white/40 transition-opacity duration-500"
                                style={{
                                    opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.2 : 1,
                                }}
                            >
                                {project.year}
                            </span>
                        </div>
                        <p
                            className="font-space text-xs tracking-widest uppercase text-white/50 transition-opacity duration-500"
                            style={{
                                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.2 : 1,
                            }}
                        >
                            {project.role}
                        </p>
                    </div>

                    {/* Hover Arrow Indicator */}
                    <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/0 group-hover:bg-white transition-all duration-400 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="black"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="-rotate-45"
                        >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </button>
            ))}
        </div>
    );
}
