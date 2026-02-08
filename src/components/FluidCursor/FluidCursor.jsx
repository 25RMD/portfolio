import { useEffect, useRef } from 'react';

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.originX = x;
    this.originY = y;
    this.life = 1;
  }
}

export default function FluidCursor({
  cursorSize = 12,
  trailSize = 50,
  particleCount = 80,
  particleLifespan = 0.92,
  returnForce = 0.03,
  cursorLerp = 0.15,
  trailLerp = 0.06,
  splatRadius = 120,
  splatForce = 0.4,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    let disposed = false;
    let animId = null;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Cursor state
    const mouse = { x: width / 2, y: height / 2 };
    const cursor = { x: width / 2, y: height / 2 };
    const trail = { x: width / 2, y: height / 2 };
    const prevMouse = { x: width / 2, y: height / 2 };
    let mouseSpeed = 0;

    // Particles for fluid trail
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(
        Math.random() * width,
        Math.random() * height
      ));
    }

    // Fluid trail history
    const trailPoints = [];
    const maxTrailPoints = 40;

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);

    const animate = () => {
      if (disposed) return;
      animId = requestAnimationFrame(animate);

      // Calculate mouse velocity
      const dx = mouse.x - prevMouse.x;
      const dy = mouse.y - prevMouse.y;
      mouseSpeed = Math.sqrt(dx * dx + dy * dy);
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;

      // Smooth cursor follow (inner dot)
      cursor.x += (mouse.x - cursor.x) * cursorLerp;
      cursor.y += (mouse.y - cursor.y) * cursorLerp;

      // Smooth trail follow (outer ring)
      trail.x += (mouse.x - trail.x) * trailLerp;
      trail.y += (mouse.y - trail.y) * trailLerp;

      // Add trail point
      trailPoints.unshift({ x: cursor.x, y: cursor.y, speed: mouseSpeed });
      if (trailPoints.length > maxTrailPoints) trailPoints.pop();

      // Update particles
      for (const p of particles) {
        const pdx = p.x - cursor.x;
        const pdy = p.y - cursor.y;
        const dist = Math.sqrt(pdx * pdx + pdy * pdy);

        if (dist < splatRadius && mouseSpeed > 1) {
          const angle = Math.atan2(pdy, pdx);
          const force = (1 - dist / splatRadius) * splatForce * Math.min(mouseSpeed * 0.1, 3);
          p.vx += Math.cos(angle) * force + dx * 0.05;
          p.vy += Math.sin(angle) * force + dy * 0.05;
        }

        // Return to origin
        p.vx += (p.originX - p.x) * returnForce;
        p.vy += (p.originY - p.y) * returnForce;

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Life based on displacement
        const displacement = Math.sqrt(
          (p.x - p.originX) ** 2 + (p.y - p.originY) ** 2
        );
        p.life = Math.min(1, displacement / 20);
      }

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw fluid trail (ribbon)
      if (trailPoints.length > 2) {
        ctx.beginPath();
        ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
        for (let i = 1; i < trailPoints.length - 1; i++) {
          const xc = (trailPoints[i].x + trailPoints[i + 1].x) / 2;
          const yc = (trailPoints[i].y + trailPoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(trailPoints[i].x, trailPoints[i].y, xc, yc);
        }
        const trailGrad = ctx.createLinearGradient(
          trailPoints[0].x, trailPoints[0].y,
          trailPoints[trailPoints.length - 1].x, trailPoints[trailPoints.length - 1].y
        );
        trailGrad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        trailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = Math.max(1, Math.min(mouseSpeed * 0.3, 8));
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        if (p.life < 0.01) continue;
        const alpha = p.life * 0.4;
        const size = 1.5 + p.life * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fill();
      }

      // Draw cursor glow (radial gradient around cursor)
      const glowSize = 60 + mouseSpeed * 2;
      const glow = ctx.createRadialGradient(
        cursor.x, cursor.y, 0,
        cursor.x, cursor.y, glowSize
      );
      glow.addColorStop(0, 'rgba(0, 0, 0, 0.06)');
      glow.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cursor.x - glowSize, cursor.y - glowSize, glowSize * 2, glowSize * 2);

      // Draw outer trail ring
      const trailDist = Math.sqrt((trail.x - mouse.x) ** 2 + (trail.y - mouse.y) ** 2);
      const trailScale = 1 + Math.min(trailDist * 0.01, 0.5);
      const ringSize = trailSize * trailScale;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, ringSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw inner cursor dot
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, cursorSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fill();
    };

    animate();

    return () => {
      disposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, [cursorSize, trailSize, particleCount, particleLifespan, returnForce, cursorLerp, trailLerp, splatRadius, splatForce]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
}
