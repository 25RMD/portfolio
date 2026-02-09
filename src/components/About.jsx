import { useRef } from 'react';
import SplitText from './SplitText';
import CountUp from './CountUp';

export default function About() {
  const containerRef = useRef(null);

  const skills = [
    { category: "Frontend", items: ["React & Nextjs", "Three.js", "WebGL", "GSAP & Framer Motion", "Tailwind"] },
    { category: "Mobile", items: ["React Native", "Expo", "Swift", "Kotlin"] },
  ];

  return (
    <section
      id="about"
      ref={containerRef}
      data-cursor-invert
      className="relative w-full min-h-screen bg-black text-white flex flex-col z-10 py-12 md:py-24 px-4 sm:px-6 md:px-12 overflow-x-clip"
    >
      
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 sm:gap-12 md:gap-24 relative z-10">
        
        {/* Header */}
        <div>
          <h2 
            className="font-syne text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase transition-transform duration-500 hover:skew-x-6 origin-left inline-block overflow-hidden"
          >
            <SplitText>What i do</SplitText>
          </h2>
        </div>

        {/* Introduction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-24 items-start">
          <div>
            <div className="group p-6 -mx-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5">
              <p className="font-space text-sm sm:text-lg md:text-xl leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                I specialize in building immersive digital experiences that bridge the gap between design and technology. 
                With a deep focus on WebGL, interaction design, and performance, I create websites and mobile apps that feel alive.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-8">
             <div className="group p-6 -mx-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5">
              <p className="font-space text-sm sm:text-base md:text-lg leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                My approach combines technical precision with artistic sensibility. whether it's a high-performance 
                marketing site or a complex mobile application, I ensure every interaction is meaningful and every pixel is polished.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 md:gap-12 reveal">
          {[
            { value: 6, suffix: '+', label: 'Projects' },
            { value: 3, suffix: '+', label: 'Years Experience' },
            { value: 2, suffix: '', label: 'Frameworks Mastered' },
            { value: 100, suffix: '%', label: 'Passion' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 group">
              <span className="font-syne text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter group-hover:text-white/90 transition-colors duration-300">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </span>
              <span className="font-space text-[10px] sm:text-xs md:text-sm tracking-widest uppercase opacity-50 group-hover:opacity-80 transition-opacity duration-300">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="flex flex-col gap-6 mt-6 sm:gap-8 sm:mt-8 md:gap-12 md:mt-12">
            <div className="w-full h-px bg-white/20 reveal-line" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                {skills.map((group, i) => (
                    <div 
                        key={group.category} 
                        className={`reveal reveal-delay-${i + 1}`}
                    >
                        <div className="group flex flex-col gap-6 p-6 -mx-6 rounded-2xl hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                            <h3 className="font-syne text-2xl font-bold uppercase group-hover:text-white transition-colors duration-300">{group.category}</h3>
                            <ul className="flex flex-col gap-3">
                                {group.items.map(item => (
                                    <li 
                                        key={item} 
                                        className="font-space text-sm md:text-base opacity-60 border-b border-white/10 pb-2 transition-all duration-300 hover:opacity-100 hover:text-white hover:translate-x-2 hover:border-white/40"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </section>
  );
}
