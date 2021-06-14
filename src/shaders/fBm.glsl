// Fractional Brownian Motion by Inigo Quilez:
// https://www.iquilezles.org/www/articles/fbm/fbm.htm
// https://www.iquilezles.org/www/articles/warp/warp.htm

#include noise/simplex/3D;

precision highp float;

float fBm (vec3 p) {
  float v = 0.0;
  float a = 0.5;

  for (int i = 0; i < 6; i++) {
    v += a * snoise(p);
    p *= 2.0;
    a *= 0.5;
  }

  return v;
}
