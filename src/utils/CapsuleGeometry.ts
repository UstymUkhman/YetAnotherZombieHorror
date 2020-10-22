// Based on: https://github.com/maximeq/three-js-capsule-geometry

import { BufferAttribute } from '@three/core/BufferAttribute';
import { BufferGeometry } from '@three/core/BufferGeometry';

import { Vector3 } from '@three/math/Vector3';
import { Vector2 } from '@three/math/Vector2';
import { PI } from '@/utils/Number';

export default class CapsuleGeometry extends BufferGeometry {
  public readonly type = 'CapsuleGeometry';

  private vertices: BufferAttribute;
  private indices: BufferAttribute;
  private normals: BufferAttribute;
  private uvs: BufferAttribute;

  private readonly segments = {
    radial: 16.0,
    height: 1.0,
    caps: 2.0
  };

  public constructor (public readonly radius: number, public readonly height: number) {
    super();

    const vertexes = this.getSegmentsCount(true);
    const indexes  = this.getSegmentsCount(false);

    this.uvs      = new BufferAttribute(new Float32Array(vertexes * 2), 2);
    this.normals  = new BufferAttribute(new Float32Array(vertexes * 3), 3);
    this.vertices = new BufferAttribute(new Float32Array(vertexes * 3), 3);
    this.indices  = new BufferAttribute(new (indexes > 65535 ? Uint32Array : Uint16Array)(indexes), 1);

    this.generateTorso();
    this.setIndex(this.indices);

    this.setAttribute('uv', this.uvs);
    this.setAttribute('normal', this.normals);
    this.setAttribute('position', this.vertices);
  }

  private getSegmentsCount (vertex: boolean): number {
    const caps   = this.segments.caps   * 2;
    const radial = this.segments.radial + ~~vertex;
    const height = this.segments.height + ~~vertex;

    return radial * (height + caps) * (~~!vertex * 5 + 1);
  }

  private generateTorso (): void {
    const halfHeight = this.height / 2;

    const length = new Vector2(this.radius, halfHeight)
          .sub(new Vector2(this.radius, -halfHeight)).length();

    const vl = this.radius * PI.d2 + length;

    const normal = new Vector3();
    const vertex = new Vector3();

    const indexArray = [];
    let index = 0, v = 0;

    for (let i = 0; i <= this.segments.caps; i++) {
      const indexRow = [];
      const angle = PI.d2 - PI.d2 * (i / this.segments.caps);

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const radius = cosA * this.radius;
      v += this.radius * PI.d2 / this.segments.caps;

      for (let j = 0; j <= this.segments.radial; j++) {
        const u = j / this.segments.radial;
        const theta = u * PI.m2;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        vertex.set(radius * sinTheta, halfHeight + sinA * this.radius, radius * cosTheta);
        this.vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

        normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
        this.normals.setXYZ(index, normal.x, normal.y, normal.z);

        this.uvs.setXY(index, u, 1 - v / vl);
        indexRow.push(index++);
      }

      indexArray.push(indexRow);
    }

    for (let i = 1; i <= this.segments.height; i++) {
      const indexRow = [];
			v += length / this.segments.height;

			for (let j = 0; j <= this.segments.radial; j++) {
				const u = j / this.segments.radial;
				const theta = u * PI.m2;

				const sinTheta = Math.sin(theta);
				const cosTheta = Math.cos(theta);

        vertex.set(this.radius * sinTheta, halfHeight - i * this.height / this.segments.height, this.radius * cosTheta);
				this.vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

				normal.set(sinTheta, 0, cosTheta).normalize();
				this.normals.setXYZ(index, normal.x, normal.y, normal.z);

				this.uvs.setXY(index, u, 1 - v / vl);
				indexRow.push(index++);
			}

			indexArray.push(indexRow);
    }

    for (let i = 1; i <= this.segments.caps; i++) {
      const indexRow = [];
      const angle = -PI.d2 * (i / this.segments.caps);

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const radius = cosA * this.radius;
      v += this.radius * PI.d2 / this.segments.caps;

      for (let j = 0; j <= this.segments.radial; j++) {
        const u = j / this.segments.radial;
        const theta = u * PI.m2;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        vertex.set(radius * sinTheta, -halfHeight + sinA * this.radius, radius * cosTheta);
        this.vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

        normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
        this.normals.setXYZ(index, normal.x, normal.y, normal.z);

        this.uvs.setXY(index, u, 1 - v / vl);
        indexRow.push(index++);
      }

      indexArray.push(indexRow);
    }

    for (let index = 0, i0 = 0, i1 = 1; i0 < this.segments.radial; i0++, i1++) {
      const indexes = this.segments.height + this.segments.caps * 2;

      for (let j0 = 0, j1 = 1; j0 < indexes; j0++, j1++) {
				const x0 = indexArray[j0][i0];
				const x1 = indexArray[j1][i0];
				const x2 = indexArray[j1][i1];
				const x3 = indexArray[j0][i1];

        this.indices.setX(index++, x0);
        this.indices.setX(index++, x1);
        this.indices.setX(index++, x3);

        this.indices.setX(index++, x1);
        this.indices.setX(index++, x2);
        this.indices.setX(index++, x3);
			}
		}
  }
}
