#include ../utils/saturate;

float noiseSample;
const int FBM_OCTAVES = 6;
const float heightFactor = 0.1;

vec3 fogOrigin = cameraPosition;
float densityFactor = fogDensity;
vec3 sampleCoord = vWorldPosition * 0.00025;

float fogDepth = distance(vWorldPosition, fogOrigin);
vec3 colorFactor = fogColor * (1.0 - fogDepth * 0.001);
vec3 fogDirection = normalize(vWorldPosition - fogOrigin);

#ifdef USE_BAKED_FOG
  sampleCoord += vec3(fogTime * 0.025, 0.0, fogTime * 0.025);
  noiseSample = fBmTex(sampleCoord + fBmTex(sampleCoord));
  densityFactor *= 0.25;

#else
  sampleCoord += vec3(0.0, 0.0, fogTime * 0.1);
  densityFactor *= 0.45;

  noiseSample = fBm(sampleCoord + fBm(
      sampleCoord, FBM_OCTAVES
    ), FBM_OCTAVES
  );
#endif

fogDepth *= mix(noiseSample * 0.5 + 0.5, 1.0, saturate((fogDepth - 5000.0) / 5000.0));
fogDepth *= fogDepth;

float fogFactor = heightFactor * exp(-fogOrigin.y * densityFactor) * (
  1.0 - exp(-fogDepth * fogDirection.y * densityFactor)
);

fragColor.rgb = mix(fragColor.rgb, colorFactor, saturate(
    fogFactor / fogDirection.y
  )
);
