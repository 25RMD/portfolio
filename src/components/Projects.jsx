import { useNavigate } from 'react-router-dom';
import ProjectGrid from './ProjectGrid';
import SplitText from './SplitText';
import PROJECTS from '../data/projects';
import { getLenis } from '../hooks/useLocomotiveScroll';

export default function Projects() {
  const navigate = useNavigate();

  const handleProjectClick = (index) => {
    const project = PROJECTS[index];
    if (project) {
      const lenis = getLenis();
      const currentScroll =
        typeof lenis?.scroll === 'number'
          ? lenis.scroll
          : typeof lenis?.animatedScroll === 'number'
            ? lenis.animatedScroll
            : window.scrollY;
      sessionStorage.setItem('homeScrollY', String(Math.round(currentScroll)));
      sessionStorage.setItem('homeScrollTarget', 'projects');
      navigate(`/projects/${project.slug}`);
    }
  };

  return (
    <section
      id="projects"
      data-cursor-invert
      className="relative w-full min-h-screen bg-black text-white z-10 py-10 md:py-24 px-4 sm:px-6 md:px-12 overflow-x-clip"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-10 md:gap-16 relative z-10">
        <div className="flex flex-col gap-6">
          <h2
            className="font-syne text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase transition-transform duration-500 hover:skew-x-6 origin-left inline-block overflow-hidden"
          >
            <SplitText>My Works</SplitText>
          </h2>
          <p
            className="font-space text-sm sm:text-base md:text-lg text-white/60 max-w-2xl leading-relaxed"
          >
            A curated selection of projects I've built — from web platforms and mobile apps to blockchain tools and AI-powered systems.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 reveal-line" />

        {/* Project Grid */}
        <ProjectGrid
          projects={PROJECTS}
          onProjectClick={handleProjectClick}
        />
      </div>
    </section>
  );
}
