attribute float angle;
attribute float size;

uniform float ratio;

varying vec2 vAngle;

void main (void) {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = size * ratio / gl_Position.w;
  vAngle = vec2(cos(angle), sin(angle));
}
