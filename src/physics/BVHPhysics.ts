import type { BoundsOptions, BVHGeometry, SeparatingAxisTriangle } from '@/physics/types';
import { StaticGeometryGenerator, MeshBVH, disposeBoundsTree } from 'three-mesh-bvh';

import PhysicsWorld from '@/physics/PhysicsWorld';
import { GameEvents } from '@/events/GameEvents';
import { Matrix4 } from 'three/src/math/Matrix4';

import { Vector3 } from 'three/src/math/Vector3';
import { Group } from 'three/src/objects/Group';
import { Mesh } from 'three/src/objects/Mesh';

import { Direction } from '@/utils/Direction';
import { Line3 } from 'three/src/math/Line3';
import { Box3 } from 'three/src/math/Box3';

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

  private updateCollisions (): void {
    const characters = Array.from(this.characters.values());

    for (let i = characters.length; i--; ) {
      const iCollider = characters[i];

      for (let j = i; j--; ) {
        const jCollider = characters[j];
        this.linearVelocity.subVectors(iCollider.position, jCollider.position);

        const depth = this.linearVelocity.length() - (
          iCollider.userData.radius + jCollider.userData.radius
        );

        if (depth > 0) continue;
        this.linearVelocity.normalize();

        const iVelocity = this.characterVelocity.get(iCollider.uuid) as Vector3;
        const jVelocity = this.characterVelocity.get(jCollider.uuid) as Vector3;

        const iVelocityDot = iVelocity.dot(this.linearVelocity);
        const jVelocityDot = jVelocity.dot(this.linearVelocity);

        const iOffsetRatio = Math.max(iVelocityDot, 0.2);
        const jOffsetRatio = Math.max(jVelocityDot, 0.2);

        const totalRatio = iOffsetRatio + jOffsetRatio;

        const iRatio = iOffsetRatio / totalRatio;
        const jRatio = jOffsetRatio / totalRatio;

        const { y: iY } = iCollider.position;
        const { y: jY } = jCollider.position;

        iCollider.position.addScaledVector(this.linearVelocity, -iRatio * depth);
        jCollider.position.addScaledVector(this.linearVelocity, jRatio * depth);

        iCollider.position.y = iY;
        jCollider.position.y = jY;
      }
    }
  }

  private addPhysicsCollider (): void {
		this.environment.updateMatrixWorld(true);

    const staticGenerator = new StaticGeometryGenerator(this.environment);
    staticGenerator.attributes = ['position'];

    const mergedGeometry = staticGenerator.generate();
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

  public setCharacter (collider: Mesh): void {
    this.characterVelocity.set(collider.uuid, new Vector3());
    this.characters.set(collider.uuid, collider);

    const { height, radius } = collider.userData;
    collider.geometry.translate(0, -radius, 0);
    collider.children[0].translateY(-radius);

    const { x, z } = collider.position;
    collider.position.set(x, height, z);
    this.move(collider.uuid, Direction.UP);
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
    const velocity = this.characterVelocity.get(uuid);
    velocity?.setScalar(0);
  }

  public update (delta: number): void {
    if (this.paused) return;
    this.delta = delta * 0.2;
    this.updateCollisions();
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
