#ifdef USE_FOG
  float heightFactor = 0.5;
  vec3 fogOrigin = cameraPosition;

  float fogDepth = distance(vWorldPosition, fogOrigin);
  vec3 fogDirection = normalize(vWorldPosition - fogOrigin);

  vec3 noiseSampleCoord = vWorldPosition * 0.00025 + vec3(
    0.0, 0.0, fogTime * 0.025
  );

  float noiseSample = fBm(noiseSampleCoord + fBm(noiseSampleCoord)) * 0.5 + 0.5;

  fogDepth *= mix(noiseSample, 1.0, saturate((fogDepth - 5000.0) / 5000.0));
  fogDepth *= fogDepth;

  float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
    1.0 - exp(-fogDepth * fogDirection.y * fogDensity)
  );

  gl_FragColor.rgb = mix(
    gl_FragColor.rgb, fogColor,
    saturate(fogFactor / fogDirection.y) * 0.75
  );
#endif
