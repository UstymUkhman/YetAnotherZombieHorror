in vec3 vWorldPosition;
uniform float fogTime;
uniform vec3 fogColor;

#ifdef FOG_EXP2
  uniform float fogDensity;
#else
  uniform float fogNear;
  uniform float fogFar;
#endif
