uniform sampler2D fire;

varying vec2 vAngle;

out vec4 fragColor;

void main (void) {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(
    vAngle.x, vAngle.y, -vAngle.y, vAngle.x
  ) + 0.5;

  fragColor = texture(fire, coords);
}
