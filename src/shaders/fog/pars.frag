#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#ifdef USE_FOG
  #include uniforms.frag;

  #ifdef FOG_EXP2
    #include ../fBm;
  #endif
#endif
