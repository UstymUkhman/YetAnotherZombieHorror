#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#define PI 3.141592653589793
#define HALF_PI PI / 2.0

uniform float traces;
uniform vec3  color;
uniform float time;

out vec4 fragColor;
in  vec2 vUv;

void main (void)
{
  float y = vUv.y;
  float width = traces * 7.5;

  float loops = time / HALF_PI;
  float alpha = mod(y + fract(loops), 1.0 / width);

  alpha = sin(alpha * width * PI) - 0.25;
  alpha = clamp(alpha * 0.25, 0.0, 1.0) * y;

  fragColor = vec4(color, alpha);
}
