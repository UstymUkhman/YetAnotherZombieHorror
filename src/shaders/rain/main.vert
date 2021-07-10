attribute float alpha;
uniform float ratio;

out float vAlpha;
out float vSize;
out float vPos;
out vec2  vUv;

void main (void) {
  const float size = 5.0;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * ratio / gl_Position.w;

  vPos = mvPosition.z;
  vAlpha = alpha;
  vSize = size;
  vUv = uv;
}
