#ifdef USE_FOG
  #include ../fBm;

  float heightFactor = 0.25;
  vec3 fogOrigin = cameraPosition;

  vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
  float fogDepth = distance(vWorldPosition, fogOrigin);

  fogDepth *= fogDepth;

  vec3 noiseSampleCoord = vWorldPosition * 0.00025;
  float noiseSample = fBm(noiseSampleCoord + fBm(noiseSampleCoord)) * 0.5 + 0.5;

  fogDepth *= noiseSample;

  float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
    1.0 - exp(-fogDepth * fogDirection.y * fogDensity)
  );

  fogFactor = saturate(fogFactor / fogDirection.y);
	gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif
