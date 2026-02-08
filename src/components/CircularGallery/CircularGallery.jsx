import { useEffect, useRef } from 'react';
import { GalleryEngine } from './GalleryEngine.js';

const DEFAULT_ITEMS = [
  { image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=800&fit=crop', text: 'Project One' },
  { image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=800&fit=crop', text: 'Project Two' },
  { image: 'https://images.unsplash.com/photo-1470770841497-7b3200f18585?w=600&h=800&fit=crop', text: 'Project Three' },
  { image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=800&fit=crop', text: 'Project Four' },
  { image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=800&fit=crop', text: 'Project Five' },
  { image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=800&fit=crop', text: 'Project Six' },
];

export default function CircularGallery({
  items = DEFAULT_ITEMS,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px sans-serif',
  scrollSpeed = 2,
  scrollEase = 0.05,
  onItemClick,
  scrollProgress = 0,
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    engineRef.current = new GalleryEngine(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      onItemClick,
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onItemClick]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateScroll(scrollProgress);
    }
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 5,
      }}
    />
  );
}
