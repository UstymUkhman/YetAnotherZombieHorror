// Hash without Sine
// The MIT License (MIT)
// Copyright (c) 2014 David Hoskins
// https://www.shadertoy.com/view/4djSRW

precision highp float;

float hash11 (float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

// Precision-adjusted variation:
// https://www.shadertoy.com/view/4dS3Wd
float hash11v (float p) {
  p = fract(p * 0.011);
  p *= p + 7.5;
  p *= p + p;
  return fract(p);
}

float hash12 (vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Precision-adjusted variation:
// https://www.shadertoy.com/view/4dS3Wd
float hash12v (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.13);
  p3 += dot(p3, p3.yzx + 3.333);
  return fract((p3.x + p3.y) * p3.z);
}

float hash13 (vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec2 hash2 (vec3 p2) {
	p2 = fract(p2 * vec3(0.1031, 0.1030, 0.0973));
  p2 += dot(p2, p2.yzx + 33.33);

  return fract(
    (p2.xx + p2.yz) * p2.zy
  );
}

vec2 hash21 (float p) {
  return hash2(vec3(p));
}

vec2 hash22 (vec2 p) {
  return hash2(vec3(p.xyx));
}

vec2 hash23 (vec3 p) {
  return hash2(p);
}

vec3 hash3 (vec3 p3) {
	p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);

  return fract(
    (p3.xxy + p3.yxx) * p3.zyx
  );
}

vec3 hash31 (float p) {
  return hash3(vec3(p));
}

vec3 hash32 (vec2 p) {
  return hash3(vec3(p.xyx));
}

vec3 hash33 (vec3 p) {
  return hash3(p);
}

vec4 hash4 (vec4 p4) {
	p4 = fract(p4 * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  p4 += dot(p4, p4.wzxy + 33.33);

  return fract(
    (p4.xxyz + p4.yzzw) * p4.zywx
  );
}

vec4 hash41 (float p) {
  return hash4(vec4(p));
}

vec4 hash42 (vec2 p) {
  return hash4(vec4(p.xyxy));
}

vec4 hash43 (vec3 p) {
  return hash4(vec4(p.xyzx));
}

vec4 hash43 (vec4 p) {
  return hash4(p);
}

/**
  * Old variations of "hash" functions.
  * Might be more performant, but are often
  * described as "replace by something better".
  *
  float hashOld12 (vec2 p) {
    return fract(
      sin(
        dot(p, vec2(12.9898, 78.233))
      ) * 43758.5453123
    );
  }

  float hashOld12 (vec2 p) {
    p = 50.0 * fract(
      p * 0.3183099 + vec2(0.71, 0.113)
    );

    return -1.0 + 2.0 * fract(
      p.x * p.y * (p.x + p.y)
    );
  }

  float hashOld13 (vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;

    return fract(p.x * p.y * p.z * (
      p.x + p.y + p.z
    ));
  }

  vec2 hashOld22 (vec2 p) {
    p = vec2(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3))
    );

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  vec3 hashOld33 (vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7,  74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );

    return fract(sin(p) * 43758.5453123);
  }
*/
