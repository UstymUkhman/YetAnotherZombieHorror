// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/common.glsl.js#L9

#ifndef saturate
  #define saturate(a) clamp(a, 0.0, 1.0)
#endif
