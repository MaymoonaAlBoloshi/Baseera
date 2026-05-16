export const speedGridVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

export const speedGridFragmentShader = `
  uniform float uTime;

  uniform float uSpeed;
  uniform float uDepthDensity;
  uniform float uVerticalDensity;

  uniform float uDepthThickness;
  uniform float uVerticalThickness;

  uniform vec3 uWireColor;

  uniform float uFadePower;
  uniform float uGradientStrength;

  varying vec2 vUv;

  float gridLine(
    float value,
    float thickness
  ) {
    return smoothstep(
      thickness,
      0.0,
      abs(fract(value) - 0.5)
    );
  }

  void main() {
    vec2 uv = vUv;

    float movingDepth =
      (1.0 - uv.x) *
      uDepthDensity -
      (uTime * uSpeed);

    float depthLines =
      gridLine(
        movingDepth,
        uDepthThickness
      );

    float verticalLines =
      gridLine(
        uv.y * uVerticalDensity,
        uVerticalThickness
      );

    float grid =
      max(depthLines, verticalLines);

    float fade =
      pow(
        1.0 - uv.x,
        uFadePower
      );

    float wallGradient =
      pow(
        sin(uv.y * 3.14159),
        uGradientStrength
      );

    float finalIntensity =
      grid *
      fade *
      wallGradient;

    gl_FragColor =
      vec4(uWireColor, finalIntensity);
  }
`;