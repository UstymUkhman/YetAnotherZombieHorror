#include noise/cnoise3D;

precision highp float;

vec3 curl (float x,  float y,  float z, float dt) {
  vec3 curl;
  float eps = 1.0;
  float n1, n2, a, b;

  x *= 0.01;
  y *= 0.01;
  z *= 0.01;

  x += dt * 0.8;
  y += dt * 0.8;
  z += dt * 0.8;

  n1 = cnoise(vec3(x, y + eps, z));
  n2 = cnoise(vec3(x, y - eps, z));
  a  = (n1 - n2) / (2. * eps);

  n1 = cnoise(vec3(x, y, z + eps));
  n2 = cnoise(vec3(x, y, z - eps));
  b  = (n1 - n2) / (2. * eps);

  curl.x = a - b;

  n1 = cnoise(vec3(x, y, z + eps));
  n2 = cnoise(vec3(x, y, z - eps));
  a  = (n1 - n2) / (2. * eps);

  n1 = cnoise(vec3(x + eps, y, z));
  n2 = cnoise(vec3(x + eps, y, z));
  b  = (n1 - n2) / (2. * eps);

  curl.y = a - b;

  n1 = cnoise(vec3(x + eps, y, z));
  n2 = cnoise(vec3(x - eps, y, z));
  a  = (n1 - n2) / (2. * eps);

  n1 = cnoise(vec3(x, y + eps, z));
  n2 = cnoise(vec3(x, y - eps, z));
  b  = (n1 - n2) / (2. * eps);

  curl.z = a - b;
  return curl;
}
