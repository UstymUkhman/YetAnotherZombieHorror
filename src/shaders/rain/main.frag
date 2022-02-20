#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#ifndef rand
  #include <common>
#endif

#include ./soft;

uniform sampler2D diffuse[5];
uniform sampler2D depth;

uniform vec2  screenSize;
uniform float dropSize;

uniform vec3  color;
uniform bool  soft;

uniform float near;
uniform float far;

out vec4 fragColor;

in vec2  vAngle;
in float vAlpha;
in float vPos;
in vec2  vUv;

void main (void) {
  mat2 rotation = mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x);
  vec2 coords = (gl_PointCoord - 0.5) * rotation + 0.5;

  int i = int(rand(vUv) * mod(dropSize, floor(dropSize)));

  float alpha = !soft ? 1.0 : softAlpha(
    depth, screenSize, dropSize, vPos, near, far
  );

  // Workaround for dynamic array
  // indexing limitation in OpenGL ES < 4.0:
  fragColor = texture(diffuse[0], coords);

       if (i == 1) fragColor = texture(diffuse[1], coords);
  else if (i == 2) fragColor = texture(diffuse[2], coords);
  else if (i == 3) fragColor = texture(diffuse[3], coords);
  else if (i == 4) fragColor = texture(diffuse[4], coords);

  fragColor.a = alpha * vAlpha;
  fragColor.rgb *= color;
}
