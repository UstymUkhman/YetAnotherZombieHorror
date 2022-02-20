#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#ifndef perspectiveDepthToViewZ
  #include <packing>
#endif

float softAlpha (
  in sampler2D depth,
  in vec2 screenSize,
  in float dropSize,

  in float position,
  in float near,
  in float far
) {
  float depthBuffer = texture(depth, gl_FragCoord.xy / screenSize.xy).x;
  float sceneDepth = perspectiveDepthToViewZ(depthBuffer, near, far);
  float depthColor = (position - sceneDepth) / (dropSize * 0.25);

  float alpha = clamp(depthColor, 0.0, 1.0);
  alpha = smoothstep(0.0, 1.0, alpha);
  // or: alpha = pow(alpha, 2.0);

  return alpha;
}
