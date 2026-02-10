import { useState, useEffect, useLayoutEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import InvertCursor from './components/InvertCursor'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import SplashScreen from './components/SplashScreen'
import ProjectDetailPage from './components/ProjectDetail'
import useLenis, { getLenis } from './hooks/useLocomotiveScroll'
import useScrollReveal from './hooks/useScrollReveal'
import useParallax from './hooks/useParallax'

const MotionDiv = motion.div;

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

const pageTransition = {
    duration: 0.4,
    ease: 'easeInOut',
}

function HomePage({ isLoading }) {
    const location = useLocation()
    useLayoutEffect(() => {
        let saved = sessionStorage.getItem('homeScrollY')
        let target = sessionStorage.getItem('homeScrollTarget')
        if (!target && location.hash) {
            target = location.hash.replace('#', '')
        }

        if (saved === null && !target) {
            return
        }

        let rafId = null
        let tries = 0
        let syncFrames = 0
        let didApplySavedNative = false
        let didApplyTargetNative = false

        const tick = () => {
            tries += 1

            const lenis = getLenis()

            if (saved !== null) {
                const y = parseInt(saved, 10)
                if (Number.isFinite(y)) {
                    if (lenis) {
                        // Hold native scroll
                        window.scrollTo(0, y)
                        
                        if (didApplySavedNative) {
                            syncFrames++
                            if (syncFrames > 15) {
                                lenis.resize()
                                lenis.scrollTo(y, { immediate: true, force: true })
                                lenis.start()
                                sessionStorage.removeItem('homeScrollY')
                                sessionStorage.removeItem('homeScrollTarget')
                                saved = null
                                target = null
                                return
                            }
                        } else {
                            didApplySavedNative = true
                        }
                    }
                } else {
                    sessionStorage.removeItem('homeScrollY')
                    saved = null
                }
            }

            if (target === 'projects') {
                const projectsEl = document.getElementById('projects')
                if (projectsEl) {
                    const rect = projectsEl.getBoundingClientRect()
                    const targetY = Math.max(0, rect.top + window.scrollY - 24)
                    if (lenis) {
                        // Hold native scroll
                        window.scrollTo(0, targetY)

                        if (didApplyTargetNative) {
                            syncFrames++
                            lenis.resize()

                            if ((syncFrames > 15 && lenis.limit >= targetY) || syncFrames > 60) {
                                lenis.scrollTo(targetY, { immediate: true, force: true })
                                lenis.start()
                                sessionStorage.removeItem('homeScrollTarget')
                                target = null
                                return
                            }
                        } else {
                            didApplyTargetNative = true
                        }
                    }

                    if (!didApplyTargetNative) {
                        window.scrollTo(0, targetY)
                        didApplyTargetNative = true
                    }
                }
            }

            if (tries < 120 && (saved !== null || target)) {
                rafId = requestAnimationFrame(tick)
            }
        }

        rafId = requestAnimationFrame(tick)

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [location.hash])

    return (
        <>
            <div id="home" />
            {/* Hero is fixed, spacer pushes content below */}
            <Hero isLoading={isLoading} />
            <div className="h-svh" aria-hidden="true" />
            <About />
            <Projects />
            <Contact />
            <Footer />
        </>
    )
}

function App() {
    const [isLoading, setIsLoading] = useState(true)
    const location = useLocation()
    useLenis()
    useScrollReveal(location.pathname)
    useParallax()

    useEffect(() => {
        const lenis = getLenis()
        if (lenis) {
            // Prevent browser from restoring scroll, we handle it manually
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual'
            }
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
                {isLoading && location.pathname === '/' && (
                    <SplashScreen onComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <MotionDiv
                    key={location.pathname}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                >
                    <Routes location={location}>
                        <Route path="/" element={<HomePage isLoading={isLoading} />} />
                        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                    </Routes>
                </MotionDiv>
            </AnimatePresence>

            <InvertCursor />
            <ScrollProgress />
            <div className="grain-overlay" aria-hidden="true" />
        </main>
    )
}

export default App
