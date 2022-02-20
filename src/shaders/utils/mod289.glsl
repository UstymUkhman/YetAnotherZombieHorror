#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

float mod289 (float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289 (vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289 (vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289 (vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
