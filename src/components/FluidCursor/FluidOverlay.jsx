import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FluidSimulation } from './FluidSimulation.js';
import { noiseFieldFrag, noiseFieldVert } from './noiseFieldShaders.js';

export default function FluidOverlay({
  splatRadius = 0.001,
  splatForce = 8000,
  dissipation = 0.97,
  pressureIterations = 20,
  cursorLerp = 0.12,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.offsetWidth || window.innerWidth;
    let height = container.offsetHeight || window.innerHeight;
    if (width === 0 || height === 0) {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    let disposed = false;
    let animId = null;

    const mouse = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };
    const prevMouse = { x: 0.5, y: 0.5 };

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    container.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Fluid sim
    const fluidSim = new FluidSimulation(renderer, { simWidth: 128, simHeight: 128 });
    fluidSim.advectionMat.uniforms.uDissipation.value = dissipation;
    fluidSim.pressureIterations = pressureIterations;
    fluidSim.splatMat.uniforms.uRadius.value = splatRadius;

    // Noise field quad
    const mat = new THREE.ShaderMaterial({
      vertexShader: noiseFieldVert,
      fragmentShader: noiseFieldFrag,
      uniforms: {
        uTime: { value: 0 },
        uFluidVelocity: { value: fluidSim.getVelocityTexture() },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);

    // Mouse
    const onMouseMove = (e) => {
      mouse.x = e.clientX / width;
      mouse.y = 1.0 - e.clientY / height;
    };

    const onResize = () => {
      width = container.offsetWidth || window.innerWidth;
      height = container.offsetHeight || window.innerHeight;
      renderer.setSize(width, height);
      mat.uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    let lastTime = performance.now();

    const animate = () => {
      if (disposed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      // Lerp mouse
      smoothMouse.x += (mouse.x - smoothMouse.x) * cursorLerp;
      smoothMouse.y += (mouse.y - smoothMouse.y) * cursorLerp;

      // Splat
      const dx = smoothMouse.x - prevMouse.x;
      const dy = smoothMouse.y - prevMouse.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.00005) {
        fluidSim.splat(smoothMouse.x, smoothMouse.y, dx * splatForce, dy * splatForce);
      }
      prevMouse.x = smoothMouse.x;
      prevMouse.y = smoothMouse.y;

      // Step fluid
      fluidSim.step(dt);

      // Update uniforms
      mat.uniforms.uTime.value += dt;
      mat.uniforms.uFluidVelocity.value = fluidSim.getVelocityTexture();
      mat.uniforms.uMouse.value.set(smoothMouse.x, smoothMouse.y);

      // Render
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      fluidSim.dispose();
      mat.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [splatRadius, splatForce, dissipation, pressureIterations, cursorLerp]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 45,
        overflow: 'hidden',
      }}
    />
  );
}
