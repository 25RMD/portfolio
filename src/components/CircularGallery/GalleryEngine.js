import {
  Renderer,
  Camera,
  Transform,
  Plane,
  Mesh,
  Program,
  Texture,
} from 'ogl';
import { vertex, fragment, textVertex, textFragment } from './shaders.js';

function createTextTexture(gl, text, font, color) {
  const dpr = Math.min(window.devicePixelRatio, 3);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseFloat(font) * 1.6) || 48;

  const logicalW = textWidth + 40;
  const logicalH = textHeight + 20;
  canvas.width = logicalW * dpr;
  canvas.height = logicalH * dpr;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, logicalW, logicalH);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, logicalW / 2, logicalH / 2);

  const texture = new Texture(gl, {
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
  texture.image = canvas;
  return { texture, width: logicalW, height: logicalH };
}

function loadTexture(gl, src) {
  const texture = new Texture(gl, {
    generateMipmaps: true,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR,
  });
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    texture.image = img;
  };
  img.src = src;
  return texture;
}

export class GalleryEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.items = options.items || [];
    this.bend = options.bend ?? 3;
    this.textColor = options.textColor || '#ffffff';
    this.borderRadius = options.borderRadius ?? 0.05;
    this.font = options.font || 'bold 30px sans-serif';
    this.scrollSpeed = options.scrollSpeed ?? 2;
    this.scrollEase = options.scrollEase ?? 0.05;
    this.onItemClick = options.onItemClick;
    this.scroll = { current: 0, target: 0, last: 0 };
    this.isDragging = false;
    this.dragStart = 0;
    this.dragScrollStart = 0;
    this.velocity = 0;
    this.meshes = [];
    this.textMeshes = [];
    this.disposed = false;

    this._init();
  }

  _init() {
    const { container } = this;

    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    container.appendChild(this.gl.canvas);
    this.gl.canvas.style.width = '100%';
    this.gl.canvas.style.height = '100%';

    this.camera = new Camera(this.gl, { fov: 45 });
    this.camera.position.z = 6;
    this.camera.position.y = 0;

    this.scene = new Transform();

    this._createItems();

    this._resize();
    this._boundResize = this._resize.bind(this);
    window.addEventListener('resize', this._boundResize);

    this._bindEvents();
    this._animate();
  }

  _createItems() {
    const { gl, scene, items } = this;
    const itemCount = items.length;
    if (itemCount === 0) return;

    this.itemCount = itemCount;
    this.spacing = 2.4;
    this.totalWidth = itemCount * this.spacing;

    const planeGeo = new Plane(gl, { width: 1.8, height: 2.4, widthSegments: 1, heightSegments: 1 });
    const textGeo = new Plane(gl, { width: 1.0, height: 1.0, widthSegments: 1, heightSegments: 1 });

    items.forEach((item, i) => {
      const texture = loadTexture(gl, item.image);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: texture },
          uAlpha: { value: 1 },
          uBorderRadius: { value: this.borderRadius },
          uResolution: { value: [1.8, 2.4] },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const mesh = new Mesh(gl, { geometry: planeGeo, program });
      mesh.setParent(scene);
      mesh._baseX = i * this.spacing;
      this.meshes.push(mesh);

      const { texture: textTex, width: tw, height: th } = createTextTexture(
        gl, item.text, this.font, this.textColor
      );
      const textAspect = tw / th;
      const textH = 0.3;
      const textW = textH * textAspect;

      const textProgram = new Program(gl, {
        vertex: textVertex,
        fragment: textFragment,
        uniforms: {
          tMap: { value: textTex },
          uAlpha: { value: 1 },
          uColor: { value: this._parseColor(this.textColor) },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const textMesh = new Mesh(gl, { geometry: textGeo, program: textProgram });
      textMesh.scale.set(textW, textH, 1);
      textMesh.setParent(scene);
      textMesh._baseX = i * this.spacing;
      this.textMeshes.push(textMesh);
    });
  }

  _parseColor(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return [r, g, b];
  }

  _resize() {
    if (this.disposed) return;
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    this.renderer.setSize(width, height);
    this.camera.perspective({ aspect: width / height });
  }

  _bindEvents() {
    const canvas = this.gl.canvas;

    this._onTouchStart = (e) => {
      this.isDragging = true;
      this.dragStart = e.touches[0].clientX;
      this.dragScrollStart = this.scroll.target;
      this.velocity = 0;
    };

    this._onTouchMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.touches[0].clientX;
      const delta = (this.dragStart - x) * 0.005 * this.scrollSpeed;
      this.scroll.target = this.dragScrollStart + delta;
    };

    this._onTouchEnd = () => {
      this.isDragging = false;
    };

    this._onMouseDown = (e) => {
      this.isDragging = true;
      this.dragStart = e.clientX;
      this.dragScrollStart = this.scroll.target;
      this.velocity = 0;
      canvas.style.cursor = 'grabbing';
    };

    this._onMouseMove = (e) => {
      if (!this.isDragging) return;
      const x = e.clientX;
      const delta = (this.dragStart - x) * 0.005 * this.scrollSpeed;
      this.scroll.target = this.dragScrollStart + delta;
    };

    this._onMouseUp = () => {
      this.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    this._onClick = (e) => {
      if (Math.abs(this.dragStart - e.clientX) > 10) return;

      const rect = canvas.getBoundingClientRect();
      const x = 2.0 * ((e.clientX - rect.left) / rect.width) - 1.0;
      const y = 2.0 * (1.0 - ((e.clientY - rect.top) / rect.height)) - 1.0;

      let closestDist = Infinity;
      let hitIndex = -1;

      this.meshes.forEach((mesh, i) => {
        mesh.updateMatrixWorld();
        const v = mesh.position.clone();
        v.applyMatrix4(this.camera.viewMatrix);
        v.applyMatrix4(this.camera.projectionMatrix);

        const dx = x - v.x;
        const dy = y - v.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.3 && dist < closestDist) {
          closestDist = dist;
          hitIndex = i;
        }
      });

      if (hitIndex !== -1 && this.onItemClick) {
        this.onItemClick(hitIndex);
      }
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('click', this._onClick);
    canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd);
    canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  updateScroll(progress) {
    this.scroll.target = progress * this.totalWidth;
  }

  _wrapX(x) {
    const total = this.totalWidth;
    return ((x + total / 2) % total + total) % total - total / 2;
  }

  _animate() {
    if (this.disposed) return;
    this._raf = requestAnimationFrame(() => this._animate());

    this.scroll.current += (this.scroll.target - this.scroll.current) * this.scrollEase;
    this.velocity = this.scroll.current - this.scroll.last;
    this.scroll.last = this.scroll.current;

    if (!this.itemCount) return;

    const curvature = 0.15;

    this.meshes.forEach((mesh) => {
      const x = this._wrapX(mesh._baseX - this.scroll.current);
      mesh.position.x = x;
      mesh.position.z = -Math.abs(x) * curvature;
      mesh.rotation.y = 0;

      const visibility = 1 - Math.pow(Math.abs(x) / (this.totalWidth / 2), 2);
      mesh.program.uniforms.uAlpha.value = Math.max(0, visibility);
    });

    this.textMeshes.forEach((textMesh) => {
      const x = this._wrapX(textMesh._baseX - this.scroll.current);
      textMesh.position.x = x;
      textMesh.position.z = -Math.abs(x) * curvature;
      textMesh.position.y = -1.5;
      textMesh.rotation.y = 0;

      const visibility = 1 - Math.pow(Math.abs(x) / (this.totalWidth / 2), 2);
      textMesh.program.uniforms.uAlpha.value = Math.max(0, visibility);
    });

    this.renderer.render({ scene: this.scene, camera: this.camera });
  }

  dispose() {
    this.disposed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._boundResize);

    const canvas = this.gl.canvas;
    canvas.removeEventListener('click', this._onClick);
    canvas.removeEventListener('touchstart', this._onTouchStart);
    canvas.removeEventListener('touchmove', this._onTouchMove);
    canvas.removeEventListener('touchend', this._onTouchEnd);
    canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);

    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }
}
