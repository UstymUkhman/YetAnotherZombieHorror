// Fractional Brownian Motion by Inigo Quilez:
// https://www.iquilezles.org/www/articles/fbm/fbm.htm
// https://www.iquilezles.org/www/articles/warp/warp.htm

precision highp float;

#ifdef USE_BAKED_FOG
  uniform sampler2D noise;

#else
 #include snoise;
#endif

#ifndef USE_BAKED_FOG
  float fBm (vec3 point, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int o = 0; o < octaves; o++) {
      value += amplitude * snoise(point);
      point = point * 2.0 + 100.0;
      amplitude *= 0.5;
    }

    return value;
  }

#else
  float fBmTex (vec3 point) {
    // Use the green channel when sampling this texture due
    // to the extra bit of precision provided for green in
    // DXT-compressed and uncompressed RGB 565 formats.
    return texture(noise, point.zx).y * 0.5;
  }
#endif
