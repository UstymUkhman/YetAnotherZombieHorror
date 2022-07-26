import type { BoundsOptions, BVHGeometry, SeparatingAxisTriangle } from '@/physics/types';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import type { BufferGeometry } from 'three/src/core/BufferGeometry';
import { MeshBVH, disposeBoundsTree } from 'three-mesh-bvh';

import PhysicsWorld from '@/physics/PhysicsWorld';
import { GameEvents } from '@/events/GameEvents';
import { Matrix4 } from 'three/src/math/Matrix4';

import { Vector3 } from 'three/src/math/Vector3';
import { Group } from 'three/src/objects/Group';
import { Mesh } from 'three/src/objects/Mesh';

import { Line3 } from 'three/src/math/Line3';
import { Box3 } from 'three/src/math/Box3';
import { Vector } from '@/utils/Vector';

export default class BVHPhysics extends PhysicsWorld
{
  private readonly characterVelocity: Map<string, Vector3> = new Map();
  private readonly characters: Map<string, Mesh> = new Map();

  private readonly linearVelocity = new Vector3();
  private readonly environment = new Group();
  private readonly capsule = new Vector3();

  private readonly matrix = new Matrix4();
  private readonly segment = new Line3();

  private environmentCollider?: Mesh;
  private readonly box = new Box3();

  private paused = true;
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

		const mergedGeometry: BVHGeometry = mergeBufferGeometries(geometries, false);
		mergedGeometry.boundsTree = new MeshBVH(mergedGeometry, { lazyGeneration: false });

    GameEvents.dispatch('Level::AddObject', this.environment);
    this.environmentCollider = new Mesh(mergedGeometry);
  }

  protected addStaticCollider (collider: Mesh): void {
    this.environment.attach(collider);
  }

  public override createBounds (bounds: BoundsOptions, sidewalk?: BoundsOptions): void {
    super.createBounds(bounds, sidewalk);
    this.addPhysicsCollider();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setCharacter (collider: Mesh, mass?: number): void {
    this.characterVelocity.set(collider.uuid, new Vector3());
    this.characters.set(collider.uuid, collider);

    const { height, radius } = collider.userData;
    collider.geometry.translate(0, -radius, 0);
    collider.children[0].translateY(-radius);

    const { x, z } = collider.position;
    collider.position.set(x, height, z);
    this.move(collider.uuid, Vector.UP);
  }

  public move (uuid: string, direction: Vector3): void {
    const character = this.characters.get(uuid) as Mesh;
    const { segment, radius } = character.userData;

    const characterVelocity = this.characterVelocity.get(uuid) as Vector3;
    const environmentMatrix = this.environmentCollider?.matrixWorld as Matrix4;
    const environmentGeometry = this.environmentCollider?.geometry as BVHGeometry;

    characterVelocity.y += this.delta * this.GRAVITY;
    character.position.addScaledVector(characterVelocity, this.delta);

    this.linearVelocity.set(direction.x, direction.y, direction.z);
    character.position.addScaledVector(this.linearVelocity, this.SPEED * this.delta);

    character.updateMatrixWorld();
    this.box.makeEmpty();

    this.matrix.copy(environmentMatrix).invert();
    this.segment.copy(segment);

    this.segment.start
      .applyMatrix4(character.matrixWorld)
      .applyMatrix4(this.matrix);

    this.segment.end
      .applyMatrix4(character.matrixWorld)
      .applyMatrix4(this.matrix);

    this.box.expandByPoint(this.segment.start);
    this.box.expandByPoint(this.segment.end);

    this.box.min.addScalar(-radius);
    this.box.max.addScalar(radius);

    environmentGeometry.boundsTree.shapecast({
      intersectsBounds: (box: Box3) => box.intersectsBox(this.box),
      intersectsTriangle: (tri: SeparatingAxisTriangle) => {
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
    });

    const position = this.linearVelocity;
    position.copy(this.segment.start).applyMatrix4(environmentMatrix);

    const deltaVector = this.capsule;
    deltaVector.subVectors(position, character.position);

    character.position.copy(position);
    characterVelocity.setScalar(0.0);
  }

  public stop (uuid: string): void {
    (this.characterVelocity.get(uuid) as Vector3).setScalar(0);
  }

  public update (delta: number): void {
    if (this.paused) return;
    this.delta = delta / 5;
  }

  public remove (uuid: string): void {
    this.characterVelocity.delete(uuid);
    this.characters.delete(uuid);
  }

  public dispose (): void {
    const environmentGeometry = this.environmentCollider?.geometry as BVHGeometry;
    const disposeBVHGeometry = disposeBoundsTree.bind(environmentGeometry);

    environmentGeometry.dispose();
    disposeBVHGeometry();
    this.paused = true;

    this.characters.clear();
    this.environment.clear();
    this.characterVelocity.clear();

    delete this.environmentCollider;
  }

  public set pause (pause: boolean) {
    this.paused = pause;
  }
}
