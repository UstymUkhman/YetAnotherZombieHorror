// https://gist.github.com/aceslowman/d2fbad8b0f21656007e337543866539c

import { Geometry } from '@three/core/Geometry';
import { Vector3 } from '@three/math/Vector3';
import { Vector4 } from '@three/math/Vector4';
import { Face3 } from '@three/core/Face3';
import { PI } from '@/utils/Number';

export default (radius = 1, height = 2, N = 16): Geometry => {
  const geometry = new Geometry();
  const normals = [];

  for (let i = 0; i <= N / 4; i++) {
    for (let j = 0; j <= N; j++) {
      const phi = -PI.d2 + Math.PI * i / (N / 2);
      const vertex = new Vector3();
      const normal = new Vector3();
      const theta = j * PI.m2 / N;

      vertex.x = radius * Math.cos(phi) * Math.cos(theta);
      vertex.y = radius * Math.cos(phi) * Math.sin(theta);

      vertex.z = radius * Math.sin(phi);
      vertex.z -= height / 2;

      normal.x = vertex.x;
      normal.y = vertex.y;
      normal.z = vertex.z;

      geometry.vertices.push(vertex);
      normals.push(normal);
    }
  }

  for (let i = N / 4; i <= N / 2; i++) {
    for (let j = 0; j <= N; j++) {
      const phi = -PI.d2 + Math.PI * i / (N / 2);
      const vertex = new Vector3();
      const normal = new Vector3();
      const theta = j * PI.m2 / N;

      vertex.x = radius * Math.cos(phi) * Math.cos(theta);
      vertex.y = radius * Math.cos(phi) * Math.sin(theta);
      vertex.z = radius * Math.sin(phi);
      vertex.z += height / 2;

      normal.x = vertex.x;
      normal.y = vertex.y;
      normal.z = vertex.z;

      geometry.vertices.push(vertex);
      normals.push(normal);
    }
  }

  for (let i = 0; i <= N / 2; i++) {
    for (let j = 0; j < N; j++) {
      const vec = new Vector4(
        i * (N + 1) + j,
        i * (N + 1) + (j + 1),
        (i + 1) * (N + 1) + (j + 1),
        (i + 1) * (N + 1) + j
      );

      if (i === N / 4) {
        geometry.faces.push(
          new Face3(vec.x, vec.z, vec.w, [
            normals[vec.x],
            normals[vec.z],
            normals[vec.w]
          ])
        );

        geometry.faces.push(
          new Face3(vec.x, vec.y, vec.z, [
            normals[vec.x],
            normals[vec.y],
            normals[vec.z]
          ])
        );
      } else {
        geometry.faces.push(
          new Face3(vec.x, vec.y, vec.z, [
            normals[vec.x],
            normals[vec.y],
            normals[vec.z]
          ])
        );

        geometry.faces.push(
          new Face3(vec.x, vec.z, vec.w, [
            normals[vec.x],
            normals[vec.z],
            normals[vec.w]
          ])
        );
      }
    }
  }

  geometry.computeFaceNormals();
  return geometry;
};
