#include ../fog/pars.vert;

#ifdef USE_FOG
  out float vFogDepth;
#endif

out vec2 vUv;

void main (void) {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  gl_Position = projectionMatrix * mvPosition;

  #ifdef USE_FOG
    vWorldPosition = worldPosition.xyz;
    vFogDepth = -mvPosition.z;
  #endif

  vUv = uv;
}
