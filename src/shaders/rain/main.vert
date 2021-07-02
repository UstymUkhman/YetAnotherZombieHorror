// attribute float angle;
attribute float size;

#ifndef USE_VERTEX_COLORS
attribute vec4 color;
#endif

uniform float ratio;

out float positionZ;
out float vSize;

out vec4 vColor;
out vec2 vAngle;

void main (void) {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * ratio / gl_Position.w;

  // vAngle = vec2(cos(angle), sin(angle));
  vAngle = vec2(cos(0.0), sin(0.0));
  positionZ = mvPosition.z;

  vColor = color;
  vSize = size;
}
