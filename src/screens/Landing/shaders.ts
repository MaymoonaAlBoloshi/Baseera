export const speedGridVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const speedGridFragmentShader = `
  uniform float uTime;
  uniform float uSpeed;

  varying vec2 vUv;

  float gridLine(float value, float thickness) {
    return 1.0 - smoothstep(0.0, thickness, abs(fract(value) - 0.5));
  }

  void main() {
    vec2 uv = vUv;

    float movingDepthLines = gridLine(uv.y * 22.0 + uTime * uSpeed, 0.035);
    float verticalLines = gridLine(uv.x * 8.0, 0.025);

    float grid = max(movingDepthLines, verticalLines);

    float distanceFade = smoothstep(0.05, 0.95, uv.y);

    vec3 backgroundColor = vec3(0.005, 0.007, 0.012);
    vec3 gridColor = vec3(0.08, 0.75, 1.0);

    vec3 color = mix(backgroundColor, gridColor, grid * distanceFade);

    gl_FragColor = vec4(color, 1.0);
  }
`;