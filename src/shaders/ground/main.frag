vec2 position = floor(groundUV * 100.0);

vec3 pattern = vec3(0.8 + 0.2 * mod(
  floor(position.x) + floor(position.y), 2.0
));

outgoingLight = outgoingLight * pattern;
#include <output_fragment>
