import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import type { Face, Intersection } from 'three/src/core/Raycaster';

import { GameEvents } from '@/events/GameEvents';
import { Vector3 } from 'three/src/math/Vector3';
import { Matrix4 } from 'three/src/math/Matrix4';

import { Assets } from '@/loaders/AssetsLoader';
import { Direction } from '@/utils/Direction';
import { Mesh } from 'three/src/objects/Mesh';

import { Euler } from 'three/src/math/Euler';
import { PI } from '@/utils/Number';
import anime from 'animejs';

export default class Hole
{
  private readonly orientation = new Euler();
  private readonly rotation = new Matrix4();
  private readonly position = new Vector3();

  private readonly holes: Array<Mesh> = [];
  private readonly origin = new Vector3();
  private readonly scale = new Vector3();
  private material!: MeshPhongMaterial;

  private readonly surface = [
    'defaultMaterial002_24',
    'defaultMaterial002_39'
  ];

  public constructor (textures: string, scale: number) {
    this.scale.setScalar(scale * 0.5);

    Assets.Loader.loadTexture(`${textures}/hole.png`).then(texture => {
      this.material = new MeshPhongMaterial({
        polygonOffsetFactor: -0.1,
        polygonOffset: true,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        map: texture
      });
    });
  }

  public show (wall: Intersection<Mesh>): void {
    if (this.surface.includes(wall.object.name)) return;

    this.position.copy(wall.point);
    this.origin.copy(this.position);

    this.origin.add((wall.face as Face).normal);
    this.rotation.lookAt(this.origin, this.position, Direction.UP);

    this.orientation.setFromRotationMatrix(this.rotation);
    this.orientation.z = Math.random() * PI.m2;

    const geometry = new DecalGeometry(
      wall.object, wall.point, this.orientation, this.scale
    );

    this.holes.push(new Mesh(geometry, this.material.clone()));
    const h = this.holes.length - 1, hole = this.holes[h];
    GameEvents.dispatch('Level::AddObject', hole);

    anime({
      complete: this.remove.bind(this, h),
      targets: hole.material,
      easing: 'linear',
      duration: 1000,
      opacity: 0.0,
      delay: 5000
    });
  }

  private remove (h: number): void {
    if (!this.holes[h]) return;
    const hole = this.holes[h];

    (hole.material as MeshPhongMaterial).map?.dispose();
    (hole.material as MeshPhongMaterial).dispose();

    hole.geometry.dispose();
    delete this.holes[h];
    GameEvents.dispatch('Level::RemoveObject', hole);
  }

  public dispose (): void {
    for (let hole = this.holes.length; hole--;)
      this.remove(hole);

    this.material.dispose();
    this.holes.splice(0);
  }
}
