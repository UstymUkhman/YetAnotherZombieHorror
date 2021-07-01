#ifdef USE_FOG
  float noiseSample;
  const int FBM_OCTAVES = 6;
  const float fogHeight = 0.1;

  vec3 fogOrigin = cameraPosition;
  float densityFactor = fogDensity;
  vec3 sampleCoord = vWorldPosition * 0.00025;

  float fogDepth = distance(vWorldPosition, fogOrigin);
  vec3 fogDirection = normalize(vWorldPosition - fogOrigin);

  #ifdef USE_BAKED_FOG
    sampleCoord += vec3(fogTime * 0.025, 0.0, fogTime * 0.025);

    noiseSample = fBmTex(
      sampleCoord + fBmTex(sampleCoord)
    );

  #else
    densityFactor = fogDensity * 2.0;
    sampleCoord += vec3(0.0, 0.0, fogTime * 0.1);

    noiseSample = fBm(sampleCoord + fBm(
        sampleCoord, FBM_OCTAVES
      ), FBM_OCTAVES
    );
  #endif

  fogDepth *= mix(noiseSample * 0.5 + 0.5, 1.0, saturate((fogDepth - 5000.0) / 5000.0));
  fogDepth *= fogDepth;

  float fogFactor = fogHeight * exp(-fogOrigin.y * densityFactor) * (
    1.0 - exp(-fogDepth * fogDirection.y * densityFactor)
  );

  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, saturate(
    saturate(fogFactor / fogDirection.y)
  ) * 0.95);
#endif
