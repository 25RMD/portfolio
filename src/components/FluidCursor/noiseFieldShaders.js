export const noiseFieldVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const noiseFieldFrag = `
  precision highp float;
  uniform float uTime;
  uniform sampler2D uFluidVelocity;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;

    // Sample fluid velocity
    vec2 vel = texture2D(uFluidVelocity, vUv).xy;
    float speed = length(vel);

    // Distort noise coordinates by fluid velocity
    vec2 noiseCoord = uv * vec2(aspect, 1.0) * 6.0;
    noiseCoord += vel * 4.0;
    noiseCoord += uTime * 0.08;

    // Multi-octave noise
    float n = 0.0;
    n += snoise(noiseCoord) * 0.5;
    n += snoise(noiseCoord * 2.0 + uTime * 0.12) * 0.3;
    n += snoise(noiseCoord * 4.0 - uTime * 0.18) * 0.15;

    // Cursor proximity glow
    vec2 diff = uv - uMouse;
    diff.x *= aspect;
    float cursorDist = length(diff);
    float cursorGlow = smoothstep(0.35, 0.0, cursorDist) * 0.6;

    // Velocity-based brightness boost
    float velBrightness = smoothstep(0.0, 0.3, speed) * 0.8;

    // Base noise visibility
    float baseNoise = (n * 0.5 + 0.5) * 0.15;

    // Combine
    float intensity = baseNoise + cursorGlow + velBrightness;

    // Color tint based on velocity direction
    vec3 color = vec3(intensity * 0.9);
    color.r += vel.x * 0.4 + cursorGlow * 0.1;
    color.g += speed * 0.15;
    color.b += vel.y * 0.4 + cursorGlow * 0.2;

    float alpha = clamp(intensity, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;
