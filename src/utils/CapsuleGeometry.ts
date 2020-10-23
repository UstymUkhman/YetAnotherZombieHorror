// Based on: https://github.com/maximeq/three-js-capsule-geometry

import { BufferAttribute } from '@three/core/BufferAttribute';
import { BufferGeometry } from '@three/core/BufferGeometry';

import { Vector3 } from '@three/math/Vector3';
import { Vector2 } from '@three/math/Vector2';

import { PI } from '@/utils/Number';

export type CapsuleBufferGeometry = InstanceType<typeof CapsuleGeometry>;

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

    this.createCapsule();
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

  private createCapsule (): void {
    const { height, caps, radial } = this.segments;

    const halfHeight = this.height / 2;
    const indexes = height + caps * 2;

    const length = new Vector2(this.radius, halfHeight).sub(
      new Vector2(this.radius, -halfHeight)).length();

    const vLength = this.radius * PI.d2 + length;
    const indexArray = new Array(indexes + 1);

    const normal = new Vector3();
    const vertex = new Vector3();

    let index = 0, v = 0;

    for (let i = 0; i <= caps; i++) {
      const angle = PI.d2 - PI.d2 * (i / caps);
      const indexRow = new Array(radial + 1);

      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);

      const radius = cosine * this.radius;
      v += this.radius * PI.d2 / caps;

      for (let j = 0; j <= radial; j++) {
        const u = j / radial;
        const theta = u * PI.m2;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        vertex.set(radius * sinTheta, halfHeight + sine * this.radius, radius * cosTheta);
        this.vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

        normal.set(cosine * sinTheta, sine, cosine * cosTheta);
        this.normals.setXYZ(index, normal.x, normal.y, normal.z);

        this.uvs.setXY(index, u, 1 - v / vLength);
        indexRow[j] = index++;
      }

      indexArray[i] = indexRow;
    }

    for (let i = 1, c = caps; i <= height; i++) {
      const indexRow = new Array(radial + 1);
			v += length / height;

			for (let j = 0; j <= radial; j++) {
				const u = j / radial;
				const theta = u * PI.m2;

				const sinTheta = Math.sin(theta);
				const cosTheta = Math.cos(theta);

        vertex.set(this.radius * sinTheta, halfHeight - i * this.height / height, this.radius * cosTheta);
				this.vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

				normal.set(sinTheta, 0, cosTheta).normalize();
				this.normals.setXYZ(index, normal.x, normal.y, normal.z);

        this.uvs.setXY(index, u, 1 - v / vLength);
        indexRow[j] = index++;
      }

      indexArray[c + i] = indexRow;
    }

    for (let i = 1, c = caps + height; i <= caps; i++) {
      const indexRow = new Array(radial + 1);
      const angle = -PI.d2 * (i / caps);

      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);

      const radius = cosine * this.radius;
      v += this.radius * PI.d2 / caps;

      for (let j = 0; j <= radial; j++) {
        const u = j / radial;
        const theta = u * PI.m2;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        vertex.set(radius * sinTheta, -halfHeight + sine * this.radius, radius * cosTheta);
        this.vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

        normal.set(cosine * sinTheta, sine, cosine * cosTheta);
        this.normals.setXYZ(index, normal.x, normal.y, normal.z);

        this.uvs.setXY(index, u, 1 - v / vLength);
        indexRow[j] = index++;
      }

      indexArray[c + i] = indexRow;
    }

    for (let index = 0, i0 = 0, i1 = 1; i0 < radial; i0++, i1++) {
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
