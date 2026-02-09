import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import InvertCursor from './components/InvertCursor'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import SplashScreen from './components/SplashScreen'
import useLenis, { getLenis } from './hooks/useLocomotiveScroll'
import useScrollReveal from './hooks/useScrollReveal'
import useParallax from './hooks/useParallax'

function App() {
    const [isLoading, setIsLoading] = useState(true)
    useLenis()
    useScrollReveal()
    useParallax()

    useEffect(() => {
        const lenis = getLenis()
        if (lenis) {
            if (isLoading) {
                lenis.stop()
            } else {
                lenis.start()
            }
        }
    }, [isLoading])

    return (
        <main className="relative">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <SplashScreen onComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            <div id="home" />
            {/* Hero is fixed, spacer pushes content below */}
            <Hero isLoading={isLoading} />
            <div className="h-[100svh]" aria-hidden="true" />
            <About />
            <Projects />
            <Contact />
            <Footer />
            <InvertCursor />
            <ScrollProgress />
            <div className="grain-overlay" aria-hidden="true" />
        </main>
    )
}

export default App
