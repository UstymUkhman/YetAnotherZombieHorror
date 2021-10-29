uniform sampler2D smoke;
uniform sampler2D fire;

out vec4 fragColor;

in vec2  vAngle;
in float vAlpha;
in float vBlend;

void main (void) {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(
    vAngle.x, vAngle.y, -vAngle.y, vAngle.x
  ) + 0.5;

  if (vBlend > 0.0) {
    fragColor = texture(smoke, coords);
    fragColor.rgb *= fragColor.a * vAlpha;
    fragColor.a *= vAlpha * vBlend;
  }

  else {
    fragColor = texture(fire, coords);
  }
}
