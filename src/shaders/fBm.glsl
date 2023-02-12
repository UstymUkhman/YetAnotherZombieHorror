/**
 * Fractional Brownian Motion by Inigo Quilez:
 * https://www.iquilezles.org/www/articles/fbm/fbm.htm
 * https://www.iquilezles.org/www/articles/warp/warp.htm
 */

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

uniform sampler2D noise;

float fBmTex (vec3 point, int octaves)
{
  float value = 0.0;
  float amplitude = 0.5;

  for (int o = 0; o < octaves; o++)
  {
    vec3 p = fract(point);

    /**
     * Use the green channel when sampling this texture due
     * to the extra bit of precision provided for green in
     * DXT-compressed and uncompressed RGB 565 formats.
     */
    float t1 = texture(noise, p.yx).g;
    float t2 = texture(noise, p.yz).g;

    float v = (t1 + t2) * 0.5;
    value += amplitude * v;

    amplitude *= 0.5;
    point *= 2.0;

    /**
     * Alternatively, "snoise.glsl" can also be used
     * in this loop to generate noise at runtime:
     *
     * value += amplitude * snoise(point);
     * amplitude *= 0.5;
     * point *= 2.0;
     */
  }

  return value;
}
