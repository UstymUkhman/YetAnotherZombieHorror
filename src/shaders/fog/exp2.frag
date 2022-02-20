float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
fragColor.rgb = mix(fragColor.rgb, fogColor, fogFactor);
