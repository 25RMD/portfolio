import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import InvertCursor from './components/InvertCursor'
import SplashScreen from './components/SplashScreen'
import useLenis, { getLenis } from './hooks/useLocomotiveScroll'
import useScrollReveal from './hooks/useScrollReveal'

function App() {
    const [isLoading, setIsLoading] = useState(true)
    useLenis()
    useScrollReveal()

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
            <div className="h-screen" aria-hidden="true" />
            <About />
            <Projects />
            <Contact />
            <InvertCursor />
        </main>
    )
}

export default App
