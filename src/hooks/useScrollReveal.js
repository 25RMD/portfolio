import { useEffect } from 'react';

export default function useScrollReveal(depKey) {
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

    const observeAll = () => {
      const elements = document.querySelectorAll('.reveal:not(.is-inview), .reveal-line:not(.is-inview)');
      elements.forEach((el) => observer.observe(el));
    };

    observeAll();

    // Watch for new elements added to the DOM (e.g. after route change)
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, [depKey]);
}
