attribute float angle;
attribute float alpha;

uniform float dropSize;
uniform float ratio;

out vec2  vAngle;
out float vAlpha;
out float vPos;
out vec2  vUv;

void main (void) {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = dropSize * ratio / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vPos = mvPosition.z;
  vAlpha = alpha;
  vUv = uv;
}
