precision highp float;

vec2 mod289 (vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289 (vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289 (vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
