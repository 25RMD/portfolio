import { useEffect } from 'react';

export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal, .reveal-line');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
