#ifndef rand
  #include <common>
#endif

#include <packing>

uniform sampler2D diffuse[5];
uniform sampler2D depth;

uniform vec2  screenSize;
uniform float dropSize;

uniform vec3  color;
uniform float near;
uniform float far;

out vec4 fragColor;

in float vAlpha;
in float vPos;
in vec2  vUv;

void main (void) {
  float depthBuffer = texture(depth, gl_FragCoord.xy / screenSize.xy).x;
  float sceneDepth = perspectiveDepthToViewZ(depthBuffer, near, far);

  float depthColor = (vPos - sceneDepth) / (dropSize * 0.25);
  int i = int(rand(vUv) * mod(dropSize, floor(dropSize)));
  float alpha = clamp(depthColor, 0.0, 1.0);

  vec2 coords = vec2(1.0) - gl_PointCoord;
  alpha = smoothstep(0.0, 1.0, alpha);
  // or: alpha = pow(alpha, 2.0);

  // Workaround for dynamic array
  // indexing limitation in WebGL < 4.0:
  fragColor = texture(diffuse[0], coords);

       if (i == 1) fragColor = texture(diffuse[1], coords);
  else if (i == 2) fragColor = texture(diffuse[2], coords);
  else if (i == 3) fragColor = texture(diffuse[3], coords);
  else if (i == 4) fragColor = texture(diffuse[4], coords);

  fragColor.a = alpha * vAlpha;
  fragColor.rgb *= color;
}
