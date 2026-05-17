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

  vec2 aspectUv = vec2(uv.x * uAspectRatio, uv.y);

  vec2 driftUv = aspectUv;
  driftUv.x += uTime * uDriftSpeed * 0.07;

  vec2 rotUv = vec2(
    (driftUv.x - driftUv.y) * 0.7071,
    (driftUv.x + driftUv.y) * 0.7071
  );

  vec2 cell = fract(rotUv * 5.5);

  float wx = 1.0 - smoothstep(0.0, 0.042, min(cell.x, 1.0 - cell.x));
  float wy = 1.0 - smoothstep(0.0, 0.042, min(cell.y, 1.0 - cell.y));
  float wire = max(wx, wy);

  float heightFade =
    smoothstep(0.0, 0.22, uv.y) *
    smoothstep(1.0, 0.70, uv.y);
  float edgeFade =
    smoothstep(0.0, 0.10, uv.x) *
    smoothstep(1.0, 0.90, uv.x);
  float fade = heightFade * edgeFade;

  float pulse = 0.82 + 0.18 * sin(uTime * 0.16);

  float wireAlpha = wire * fade * uDriftStrength * pulse;

  gl_FragColor = vec4(uWireColor, wireAlpha * 0.65);
}
`;