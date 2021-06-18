precision highp float;

float taylorInvSqrt (float r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 taylorInvSqrt (vec2 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 taylorInvSqrt (vec3 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 taylorInvSqrt (vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
