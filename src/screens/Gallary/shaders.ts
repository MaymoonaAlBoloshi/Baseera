export const wallVertexShader = `
uniform float uTime;
uniform float uDriftStrength;
uniform float uDriftSpeed;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 transformed = position;

  float softWave =
    sin((position.x * 0.35) + (uTime * uDriftSpeed)) * uDriftStrength;

  transformed.z += softWave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

export const wallFragmentShader = `
uniform float uTime;
uniform float uShadowStrength;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  float verticalFade = smoothstep(0.0, 0.75, uv.y);

  float driftingShadow =
    sin((uv.y * 4.0) + (uTime * 0.12)) * uShadowStrength;

  vec3 baseColor = vec3(0.08, 0.075, 0.07);

  vec3 finalColor =
    baseColor
    - driftingShadow
    - ((1.0 - verticalFade) * 0.06);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;