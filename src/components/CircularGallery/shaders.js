export const vertex = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uAlpha;
  uniform float uBorderRadius;
  uniform vec2 uResolution;

  varying vec2 vUv;

  float roundedBoxSDF(vec2 center, vec2 size, float radius) {
    vec2 q = abs(center) - size + radius;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
  }

  void main() {
    vec4 color = texture2D(tMap, vUv);

    // Rounded corners
    vec2 uv = vUv * 2.0 - 1.0;
    float d = roundedBoxSDF(uv, vec2(1.0), uBorderRadius * 2.0);
    float mask = 1.0 - smoothstep(-0.01, 0.01, d);

    gl_FragColor = vec4(color.rgb, color.a * uAlpha * mask);
  }
`;

export const textVertex = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const textFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uAlpha;
  uniform vec3 uColor;

  varying vec2 vUv;

  void main() {
    float alpha = texture2D(tMap, vUv).r;
    gl_FragColor = vec4(uColor, alpha * uAlpha);
  }
`;
