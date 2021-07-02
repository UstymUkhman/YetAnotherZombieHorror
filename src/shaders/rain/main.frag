#include <packing>

uniform sampler2D diffuse;
uniform sampler2D depth;

uniform float near;
uniform float far;
uniform vec2 size;

in float positionZ;
out vec4 fragColor;

in float vSize;
in vec4 vColor;
in vec2 vAngle;

void main (void) {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  float depthBuffer = texture(depth, gl_FragCoord.xy / size.xy).x;

  float sceneDepth = perspectiveDepthToViewZ(depthBuffer, near, far);
  float depthColor = (positionZ - sceneDepth) / (vSize * 0.25);

  float alpha = clamp(depthColor, 0.0, 1.0);
  alpha = smoothstep(0.0, 1.0, alpha);
  // or: alpha = pow(alpha, 2.0);

  fragColor = texture(diffuse, coords) * vColor;
  fragColor.a = alpha * vColor.a;
}
