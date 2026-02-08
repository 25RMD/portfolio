import * as THREE from 'three';
import {
  fullscreenVert,
  splatFrag,
  advectionFrag,
  divergenceFrag,
  pressureFrag,
  gradientSubFrag,
} from './fluidShaders.js';

function createFBO(renderer, width, height, options = {}) {
  const rt = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    depthBuffer: false,
    stencilBuffer: false,
    ...options,
  });
  return rt;
}

function createDoubleFBO(renderer, width, height, options) {
  return {
    read: createFBO(renderer, width, height, options),
    write: createFBO(renderer, width, height, options),
    swap() {
      const tmp = this.read;
      this.read = this.write;
      this.write = tmp;
    },
  };
}

export class FluidSimulation {
  constructor(renderer, { simWidth = 128, simHeight = 128 } = {}) {
    this.renderer = renderer;
    this.simWidth = simWidth;
    this.simHeight = simHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);

    const texelSize = new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight);

    this.velocity = createDoubleFBO(renderer, simWidth, simHeight);
    this.pressure = createDoubleFBO(renderer, simWidth, simHeight);
    this.divergenceFBO = createFBO(renderer, simWidth, simHeight);

    this.splatMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: splatFrag,
      uniforms: {
        uTarget: { value: null },
        uPoint: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Vector3() },
        uRadius: { value: 0.0005 },
        uAspect: { value: simWidth / simHeight },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.advectionMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: advectionFrag,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        uTexelSize: { value: texelSize },
        uDt: { value: 0.016 },
        uDissipation: { value: 0.98 },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.divergenceMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: divergenceFrag,
      uniforms: {
        uVelocity: { value: null },
        uTexelSize: { value: texelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.pressureMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: pressureFrag,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        uTexelSize: { value: texelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.gradientMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: gradientSubFrag,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        uTexelSize: { value: texelSize },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.pressureIterations = 20;
  }

  _blit(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  splat(x, y, dx, dy) {
    this.splatMat.uniforms.uTarget.value = this.velocity.read.texture;
    this.splatMat.uniforms.uPoint.value.set(x, y);
    this.splatMat.uniforms.uColor.value.set(dx, dy, 0);
    this._blit(this.splatMat, this.velocity.write);
    this.velocity.swap();
  }

  step(dt) {
    // Advect velocity
    this.advectionMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this.advectionMat.uniforms.uSource.value = this.velocity.read.texture;
    this.advectionMat.uniforms.uDt.value = dt;
    this._blit(this.advectionMat, this.velocity.write);
    this.velocity.swap();

    // Compute divergence
    this.divergenceMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this._blit(this.divergenceMat, this.divergenceFBO);

    // Pressure solve (Jacobi iterations)
    for (let i = 0; i < this.pressureIterations; i++) {
      this.pressureMat.uniforms.uPressure.value = this.pressure.read.texture;
      this.pressureMat.uniforms.uDivergence.value = this.divergenceFBO.texture;
      this._blit(this.pressureMat, this.pressure.write);
      this.pressure.swap();
    }

    // Subtract pressure gradient from velocity
    this.gradientMat.uniforms.uPressure.value = this.pressure.read.texture;
    this.gradientMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this._blit(this.gradientMat, this.velocity.write);
    this.velocity.swap();
  }

  getVelocityTexture() {
    return this.velocity.read.texture;
  }

  dispose() {
    this.velocity.read.dispose();
    this.velocity.write.dispose();
    this.pressure.read.dispose();
    this.pressure.write.dispose();
    this.divergenceFBO.dispose();
    this.splatMat.dispose();
    this.advectionMat.dispose();
    this.divergenceMat.dispose();
    this.pressureMat.dispose();
    this.gradientMat.dispose();
    this.quad.geometry.dispose();
  }
}
