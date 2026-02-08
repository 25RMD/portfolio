import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import InvertCursor from './components/InvertCursor'
import SplashScreen from './components/SplashScreen'
import useLocomotiveScroll, { getLocomotiveScroll } from './hooks/useLocomotiveScroll'

function App() {
    const [isLoading, setIsLoading] = useState(true)
    useLocomotiveScroll()

    useEffect(() => {
        const scroll = getLocomotiveScroll()
        if (scroll) {
            if (isLoading) {
                scroll.stop()
            } else {
                scroll.start()
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
