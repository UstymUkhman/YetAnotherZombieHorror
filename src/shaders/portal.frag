#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#define PI  3.141592653589793
#define INTERACTIONS 5
#define PI2 PI * 2.0

uniform vec3  backgroundColor;
uniform vec3  spikesColor;
uniform float deltaTime;

out vec4 fragColor;
in  vec2 vUv;

void main (void)
{
  float ammount = 1.0;
  const float inten = 0.005;
  float time = deltaTime + 23.0;

  vec2 point = mod(vUv * PI2, PI2) - 250.0;
  vec2 p = vec2(point);

  for (int i = 0; i < INTERACTIONS; i++)
  {
    float t = time * (1.0 - 3.5 / float(i + 1));

    p = point + vec2(
      cos(t - p.x) + sin(t + p.y),
      sin(t - p.y) + cos(t + p.x)
    );

    ammount += 1.0 / length(vec2(
      point.x / (sin(p.x + t) / inten),
      point.y / (cos(p.y + t) / inten)
    ));
  }

  ammount /= float(INTERACTIONS);
  ammount = 1.17 - pow(ammount, 1.4);

  float source = length(abs(vUv - vec2(0.5)));
  float alphaFactor = smoothstep(0.0, 1.0, source) * 2.0;

  vec3 color = vec3(pow(abs(ammount), 8.0)) * spikesColor;
  color = clamp(color + backgroundColor, 0.0, 1.0);
  fragColor = vec4(color, mix(0.0, 1.0, alphaFactor));
}
