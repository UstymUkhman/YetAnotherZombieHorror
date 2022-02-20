attribute float smokeAngle;
attribute float smokeAlpha;
attribute float smokeSize;

attribute float fireAngle;
attribute float fireSize;
attribute float blend;

uniform float ratio;

out vec2  vAngle;
out float vAlpha;
out float vBlend;

void main (void) {
  float angle = fireAngle;
  float size = fireSize;

  if (blend > 0.0) {
    angle = smokeAngle;
    size = smokeSize;
  }

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = size * ratio / gl_Position.w;
  vAngle = vec2(cos(angle), sin(angle));

  vAlpha = smokeAlpha;
  vBlend = blend;
}
