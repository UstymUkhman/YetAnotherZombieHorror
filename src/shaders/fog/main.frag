#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;

#else
  precision highp float;
#endif

#ifdef USE_FOG
  vec4 fragColor = gl_FragColor;
  #include volumetric.frag;
  gl_FragColor = fragColor;
#endif
