#include ../utils/saturate;

const int FBM_OCTAVES = 8;
const float heightFactor = 0.08;

vec3 sampleCoord = vWorldPosition * 0.00025 + vec3(
  fogTime * 0.025, 0.0, fogTime * 0.025
);

float noiseSample = fBmTex(sampleCoord + fBmTex(
    sampleCoord, FBM_OCTAVES
  ), FBM_OCTAVES
) * 0.5 + 0.5;

float fogDepth = distance(vWorldPosition, cameraPosition);
vec3 fogDirection = normalize(vWorldPosition - cameraPosition);

fogDepth *= mix(noiseSample, 1.0, saturate((fogDepth - 5000.0) / 5000.0));
fogDepth *= fogDepth;

float fogFactor = saturate(heightFactor * exp(-cameraPosition.y * fogDensity) * (
  1.0 - exp(-fogDepth * fogDirection.y * fogDensity)
) / fogDirection.y);

fragColor.rgb = mix(fragColor.rgb, fogColor, fogFactor);
