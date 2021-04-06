import type { BoundsOptions, BVHGeometry, SeparatingAxisTriangle } from './physics.d';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
type BufferGeometry = import ('three/src/core/BufferGeometry').BufferGeometry;

import { GameEvents } from '@/managers/GameEvents';
import { Matrix4 } from 'three/src/math/Matrix4';
import MeshBVH from 'three-mesh-bvh/src/MeshBVH';

import { Vector3 } from 'three/src/math/Vector3';
import { Group } from 'three/src/objects/Group';
import { Mesh } from 'three/src/objects/Mesh';

import { Line3 } from 'three/src/math/Line3';
import { Box3 } from 'three/src/math/Box3';
import PhysicsWorld from './PhysicsWorld';
import { Vector } from '@/utils/Vector';

const SPEED = 5.0;

export default class BVHPhysics extends PhysicsWorld
{
  private readonly linearVelocity = new Vector3();
  private readonly playerVelocity = new Vector3();

  private readonly environment = new Group();
  private readonly capsule = new Vector3();

  private readonly matrix = new Matrix4();
  private readonly segment = new Line3();
  private readonly box = new Box3();

  private collider?: Mesh;
  private paused = false;
  private player!: Mesh;
  private delta = 0.0;

  private addPhysicsCollider (): void {
    const geometries: Array<BufferGeometry> = [];
		this.environment.updateMatrixWorld(true);

		this.environment.traverse(collider => {
      const colliderMesh = collider as Mesh;

			if (colliderMesh.geometry) {
				const colliderGeometry = colliderMesh.geometry.clone();
				colliderGeometry.applyMatrix4(colliderMesh.matrixWorld);

				for (const attribute in colliderGeometry.attributes) {
          attribute !== 'position' && colliderGeometry.deleteAttribute(attribute);
				}

				geometries.push(colliderGeometry);
			}
		});

		const mergedGeometry: BVHGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
		mergedGeometry.boundsTree = new MeshBVH(mergedGeometry, { lazyGeneration: false });

    GameEvents.dispatch('add:object', this.environment);
    this.collider = new Mesh(mergedGeometry);
  }

  protected addStaticCollider (collider: Mesh): void {
    this.environment.attach(collider);
  }

  public createBounds (bounds: BoundsOptions, sidewalk: BoundsOptions): void {
    super.createBounds(bounds, sidewalk);
    this.addPhysicsCollider();
  }

  public setPlayer (player: Mesh): void {
    const { height, radius } = player.userData;

    player.geometry.translate(0, -radius, 0);
    player.children[0].translateY(-radius);
    player.position.set(0, height, 0);

    this.player = player;
    this.move(Vector.UP);
  }

  public move (direction: Vector3): void {
    const { segment, radius } = this.player.userData;
    const colliderMatrix = this.collider?.matrixWorld as Matrix4;
    const colliderGeometry = this.collider?.geometry as BVHGeometry;

    this.playerVelocity.y += this.delta * this.GRAVITY;
    this.player.position.addScaledVector(this.playerVelocity, this.delta);

    this.linearVelocity.set(direction.x, direction.y, direction.z);
    this.player.position.addScaledVector(this.linearVelocity, SPEED * this.delta);

    this.player.updateMatrixWorld();
    this.box.makeEmpty();

    this.matrix.copy(colliderMatrix).invert();
    this.segment.copy(segment);

    this.segment.start
      .applyMatrix4(this.player.matrixWorld)
      .applyMatrix4(this.matrix);

    this.segment.end
      .applyMatrix4(this.player.matrixWorld)
      .applyMatrix4(this.matrix);

    this.box.expandByPoint(this.segment.start);
    this.box.expandByPoint(this.segment.end);

    this.box.min.addScalar(-radius);
    this.box.max.addScalar(radius);

    colliderGeometry.boundsTree.shapecast(
      this.collider,
      (box: Box3) => box.intersectsBox(this.box),
      (tri: SeparatingAxisTriangle) => {
        const capsule = this.capsule;
        const point = this.linearVelocity;

        const distance = tri.closestPointToSegment(
          this.segment, point, capsule
        );

        if (distance < radius) {
          const depth = radius - distance;
          const direction = capsule.sub(point).normalize();

          this.segment.start.addScaledVector(direction, depth);
          this.segment.end.addScaledVector(direction, depth);
        }
      }
    );

    const position = this.linearVelocity;
    position.copy(this.segment.start).applyMatrix4(colliderMatrix);

    const deltaVector = this.capsule;
    deltaVector.subVectors(position, this.player.position);

    this.player.position.copy(position);
    this.playerVelocity.set(0, 0, 0);
  }

  public stop (): void {
    this.playerVelocity.set(0, 0, 0);
  }

  public update (delta: number): void {
    if (this.paused) return;
    this.delta = delta / 5;
  }

  public destroy (): void {
    this.environment.clear();
    delete this.collider;
    this.paused = true;
  }

  public set pause (pause: boolean) {
    this.paused = pause;
  }
}
