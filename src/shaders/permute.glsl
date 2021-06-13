#include mod289;

precision highp float;

vec2 permute (vec2 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec3 permute (vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 permute (vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}
