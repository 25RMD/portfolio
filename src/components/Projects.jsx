import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ProjectDetail from './ProjectDetail';
import ProjectGrid from './ProjectGrid';

const PROJECTS = [
  {
    title: 'Black Lotus',
    role: 'Frontend Developer',
    year: '2025',
    description: 'Black Lotus is a premier web and software development agency delivering high-quality digital solutions. I contributed to building their corporate identity and client projects, ensuring robust and scalable applications.',
    link: 'https://blacklotusdev.org',
    tags: ['Company', 'Website', 'Dev Agency'],
    image: '/images/projects/blacklotus.jpg',
    websiteImage: '/images/project-details/blacklotus.png',
  },
  {
    title: 'EE Wellness',
    role: 'Frontend Developer',
    year: '2025',
    description: 'EE Wellness is a wellness center located in Lagos dedicated to holistic health. I developed both their responsive website and mobile application, creating a seamless booking and information platform for clients.',
    link: 'https://eewellnesshub.com',
    tags: ['Company', 'Website', 'Mobile App'],
    image: '/images/projects/eewellness.jpg',
    websiteImage: '/images/project-details/eewellness.png',
    appImage: ['/images/project-details/mobile/eewellness1.jpg', '/images/project-details/mobile/eewellness2.jpg'],
  },
  {
    title: 'Tomsu Foundation',
    role: 'Frontend Developer',
    year: '2025',
    description: 'Tomsu Development Foundation is an NGO with impactful actions stretching across West Africa. I built their frontend platform to showcase their initiatives, transparently display their impact, and facilitate donor engagement.',
    link: 'https://tdf-front.pages.dev/',
    tags: ['Company', 'Website', 'NGO'],
    image: '/images/projects/tomsu.jpg',
    websiteImage: '/images/project-details/tomsu.png',
  },
  {
    title: 'Tracklearn',
    role: 'Frontend Developer',
    year: '2026',
    description: 'Tracklearn is an education tool built to help school managements ensure quality of lessons being taught. It also features AI-aided learning for students. I spearheaded the development of both the web dashboard and the mobile learning app.',
    link: 'https://tracklearn.org',
    tags: ['EdTech', 'Website', 'Mobile App'],
    image: '/images/projects/tracklearn.jpg',
    websiteImage: '/images/project-details/tracklearn.png',
    appImage: '/images/project-details/mobile/tracklearnmobile.jpg',
  },
  {
    title: 'Precog',
    role: 'Full Stack Developer',
    year: '2025',
    description: 'Precog is an advanced scam detection system for Solana memecoins. It analyzes on-chain data to identify potential risks, helping traders make safer investment decisions in the volatile crypto market.',
    link: 'https://precog.trade',
    tags: ['Crypto', 'Website', 'Solana'],
    image: '/images/projects/precog.jpg',
    websiteImage: '/images/project-details/precog.png',
  },
  {
    title: 'Platz',
    role: 'Full Stack Developer',
    year: '2025',
    description: 'Platz is a platform for tokenizing land into multiple tokens that can be traded over the Ethereum blockchain. It aims to democratize real estate investment by allowing fractional ownership via smart contracts.',
    link: 'https://platz-landtokenization.vercel.app',
    tags: ['Web3', 'Website', 'Ethereum'],
    image: '/images/projects/platz.jpg',
    websiteImage: '/images/project-details/platz.png',
  },
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectSelect = (index) => {
    if (PROJECTS[index]) {
      setSelectedProject(PROJECTS[index]);
    }
  };

  return (
    <>
      <section
        id="projects"
        data-cursor-invert
        className="relative w-full min-h-screen bg-black text-white z-10 py-12 md:py-24 px-6 md:px-12 overflow-x-clip"
      >
        {/* Decorative Background Elements */}
        <div 
          className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full border border-white/20 pointer-events-none"
          style={{ animation: 'spin-slow 60s linear infinite' }}
        />
        <div 
          className="absolute top-1/3 left-10 w-6 h-6 opacity-50 pointer-events-none"
          style={{ animation: 'spin-reverse-slow 15s linear infinite' }}
        >
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white -translate-y-1/2" />
             <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white -translate-x-1/2" />
        </div>
        <div 
          className="absolute bottom-24 right-1/4 w-3 h-3 bg-white/50 rounded-full pointer-events-none"
          style={{ animation: 'pulse-subtle 3s ease-in-out infinite' }}
        />

        {/* Section Header */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-10 md:gap-16 relative z-10">
          <div className="flex flex-col gap-6">
            <h2
              className="font-syne text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase transition-transform duration-500 hover:skew-x-6 origin-left inline-block"
            >
              My Works
            </h2>
            <p
              className="font-space text-base md:text-lg text-white/60 max-w-2xl leading-relaxed"
            >
              A curated selection of projects I've built — from web platforms and mobile apps to blockchain tools and AI-powered systems.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 reveal-line" />

          {/* Project Grid */}
          <ProjectGrid
            projects={PROJECTS}
            onProjectClick={handleProjectSelect}
          />
        </div>

      </section>

      {/* Project Detail View */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail
            key="project-detail"
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
