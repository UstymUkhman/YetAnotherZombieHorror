#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#ifdef USE_FOG
  #include ../fBm;
  uniform float fogTime;

  uniform vec3 fogColor;
  varying vec3 vWorldPosition;

  #ifdef FOG_EXP2
    uniform float fogDensity;

  #else
    uniform float fogNear;
    uniform float fogFar;

  #endif
#endif
