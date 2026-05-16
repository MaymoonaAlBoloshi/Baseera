export const wallVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const wallFragmentShader = `
uniform float uTime;
uniform float uDriftStrength;
uniform float uDriftSpeed;
uniform float uShadowStrength;
uniform float uAspectRatio;
uniform vec3 uWireColor;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Correct UV so diamonds stay square regardless of wall dimensions
  vec2 aspectUv = vec2(uv.x * uAspectRatio, uv.y);

  // Slowly drift the pattern downward
  vec2 driftUv = aspectUv;
  driftUv.y -= uTime * uDriftSpeed * 0.07;

  // Rotate 45° to get a diamond lattice
  vec2 rotUv = vec2(
    (driftUv.x - driftUv.y) * 0.7071,
    (driftUv.x + driftUv.y) * 0.7071
  );

  // Grid cells
  vec2 cell = fract(rotUv * 5.5);

  // Wire: thin bright edge around each diamond cell
  float wx = 1.0 - smoothstep(0.0, 0.042, min(cell.x, 1.0 - cell.x));
  float wy = 1.0 - smoothstep(0.0, 0.042, min(cell.y, 1.0 - cell.y));
  float wire = max(wx, wy);

  // Vignette: fade toward top, bottom and side edges
  float heightFade =
    smoothstep(0.0, 0.22, uv.y) *
    smoothstep(1.0, 0.70, uv.y);
  float edgeFade =
    smoothstep(0.0, 0.10, uv.x) *
    smoothstep(1.0, 0.90, uv.x);
  float fade = heightFade * edgeFade;

  // Very slow breath pulse
  float pulse = 0.82 + 0.18 * sin(uTime * 0.16);

  float wireAlpha = wire * fade * uDriftStrength * pulse;

  // Overlay only — base colour and lighting come from meshStandardMaterial beneath
  vec3 wireColor = uWireColor;

  gl_FragColor = vec4(wireColor, wireAlpha * 0.65);
}
`;

// ─── Floor ───────────────────────────────────────────────────────────────────

export const floorVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const floorFragmentShader = `
uniform float uTime;
uniform float uAspectRatio;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Aspect-correct so tiles are physically square in world space
  vec2 aspectUv = vec2(uv.x * uAspectRatio, uv.y);

  // Tile grid — 5 tiles along the short axis
  vec2 tileUv = fract(aspectUv * 5.0);

  // Smooth grout lines — very thin and subtle
  float groutW = 0.028;
  float gx = smoothstep(0.0, groutW, tileUv.x) * smoothstep(1.0, 1.0 - groutW, tileUv.x);
  float gy = smoothstep(0.0, groutW, tileUv.y) * smoothstep(1.0, 1.0 - groutW, tileUv.y);
  float grout = 1.0 - (gx * gy);

  // Very slow drifting sheen — light catching a polished surface
  float sheen = sin(uv.x * 2.8 + uTime * 0.07) * 0.5 + 0.5;
  sheen *= sin(uv.y * 2.2 - uTime * 0.05) * 0.5 + 0.5;
  sheen = pow(sheen, 4.0) * 0.035;

  vec3 stoneColor = vec3(0.058, 0.052, 0.045);
  vec3 groutColor = vec3(0.036, 0.032, 0.028);
  vec3 sheenColor = vec3(0.14, 0.11, 0.08);

  vec3 finalColor = mix(stoneColor, groutColor, grout * 0.65);
  finalColor += sheenColor * sheen;

  // Soft edge vignette
  float edge = smoothstep(0.0, 0.07, uv.x) * smoothstep(1.0, 0.93, uv.x)
             * smoothstep(0.0, 0.07, uv.y) * smoothstep(1.0, 0.93, uv.y);

  // Overlay only — base colour and lighting come from meshStandardMaterial beneath
  // Grout lines: subtle dark overlay; sheen: subtle warm bright overlay
  float groutAlpha = grout * 0.55 * edge;
  float sheenAlpha = sheen * edge;

  vec3 groutColor = vec3(0.012, 0.010, 0.008);
  vec3 sheenColor = vec3(0.24, 0.17, 0.09);

  vec3 color = sheenAlpha > groutAlpha ? sheenColor : groutColor;
  float alpha = max(groutAlpha, sheenAlpha);

  gl_FragColor = vec4(color, alpha);
}
`;

// ─── Ceiling ─────────────────────────────────────────────────────────────────

export const ceilingVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ceilingFragmentShader = `
uniform float uTime;
uniform float uAspectRatio;

varying vec2 vUv;

// 2D value noise — cheap but smooth enough
float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vec2(vUv.x * uAspectRatio, vUv.y);

  // Very slow imperceptible drift
  vec2 driftUv = uv + vec2(uTime * 0.005, uTime * 0.003);

  // Multi-octave organic cloud noise
  float n = noise(driftUv * 2.2) * 0.500
          + noise(driftUv * 4.8 + 1.7) * 0.250
          + noise(driftUv * 9.5 + 3.3) * 0.125;
  n /= 0.875;

  vec3 voidColor  = vec3(0.028, 0.025, 0.022);
  vec3 cloudColor = vec3(0.046, 0.041, 0.036);

  vec3 finalColor = mix(voidColor, cloudColor, n * 0.45);

  // Heavy vignette — void is deepest at edges, slightly less dark at center
  float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x)
             * smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);

  // Overlay only — base colour and lighting come from meshStandardMaterial beneath
  // Cloud patches: barely-there lighter wisps drifting above
  float alpha = n * 0.13 * edge;
  vec3 cloudColor = vec3(0.10, 0.088, 0.075);

  gl_FragColor = vec4(cloudColor, alpha);
}
`;

