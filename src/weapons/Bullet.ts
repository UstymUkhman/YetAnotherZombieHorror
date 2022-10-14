import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import { CylinderGeometry } from 'three/src/geometries/CylinderGeometry';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ConeGeometry } from 'three/src/geometries/ConeGeometry';

import { DoubleSide, GLSL3 } from 'three/src/constants';
import { Quaternion } from 'three/src/math/Quaternion';
import type { BulletConfig } from '@/weapons/types';

import { CameraObject } from '@/managers/Camera';
import { GameEvents } from '@/events/GameEvents';
import { Matrix4 } from 'three/src/math/Matrix4';

import { Assets } from '@/loaders/AssetsLoader';
import type { Ray } from 'three/src/math/Ray';
import { Mesh } from 'three/src/objects/Mesh';
import { Color } from '@/utils/Color';

const MAX_PATH_LENGTH = 10.0;

export default class Bullet
{
  private bullet!: Mesh;
  public readonly speed: number;

  private readonly width    = 1.0;
  private readonly height   = 0.3;
  private readonly radius   = 0.1;
  private readonly segments = 8.0;

  private readonly rotation = new Quaternion();
  private readonly pivot = new Matrix4().makeTranslation(
    0.0, this.width / -2.0, 0.0
  );

  public constructor (private readonly config: BulletConfig) {
    this.speed = config.speed / 60.0;
    this.createBullet();
  }

  private async createBullet (): Promise<void> {
    const texture = await Assets.Loader.loadTexture('bullet.png');

    this.bullet = new Mesh(
      new ConeGeometry(this.radius, this.height, this.segments),
      new MeshStandardMaterial({ map: texture })
    );

    this.bullet.scale.setScalar(this.config.scale);
    this.bullet.add(await this.createPath());
  }

  private async createPath (): Promise<Mesh> {
    // Development imports:
    /* const vertPath = (await import('../shaders/main.vert')).default;
    const fragPath = (await import('../shaders/shot/bullet.frag')).default; */

    // Production imports:
    const vertPath = await Assets.Loader.loadShader('main.vert');
    const fragPath = await Assets.Loader.loadShader('shot/bullet.frag');

    const radius = this.radius * 1.2;

    const path = new Mesh(
      new CylinderGeometry(
        radius, radius, this.width,
        this.segments, 1.0, true
      ),

      new ShaderMaterial({
        uniforms: {
          color: { value: Color.getClass(Color.WHITE) },
          traces: { value: 0.0 },
          time: { value: 0.0 }
        },

        fragmentShader: fragPath,
        vertexShader: vertPath,

        glslVersion: GLSL3,
        transparent: true,
        depthWrite: false,
        side: DoubleSide
      })
    );

    path.geometry.applyMatrix4(this.pivot);
    path.position.y -= this.height / 2.0;

    path.scale.y = 0.0;
    return path;
  }

  public shoot (ray: Ray, aiming: boolean): Mesh {
    const z = this.config.position.z;
    const { lifeTime } = this.config;

    const bullet = this.bullet.clone();
    const offset = +!aiming * 0.01 + 0.01;

    bullet.userData.direction = ray.direction.clone();
    bullet.userData.lifeTime = Date.now() + lifeTime;
    GameEvents.dispatch('Level::AddObject', bullet);

    CameraObject.getWorldQuaternion(this.rotation);
    bullet.userData.direction.y += offset;

    bullet.quaternion.copy(this.rotation);
    bullet.position.copy(ray.origin);

    bullet.rotateX(-1.56);
    bullet.translateY(z);

    return bullet;
  }

  public update (bullet: Mesh): void {
    const path = bullet.children[0] as Mesh;
    const material = path.material as ShaderMaterial;

    bullet.position.addScaledVector(
      bullet.userData.direction, this.speed
    );

    if (path.scale.y >= MAX_PATH_LENGTH)
      material.uniforms.time.value += 0.1;

    else
      material.uniforms.traces.value =
        path.scale.y += this.speed;

    bullet.rotateY(0.5);
  }

  public dispose (): void {
    const bulletMaterial = this.bullet.material as MeshStandardMaterial;

    const path = this.bullet.children[0] as Mesh | undefined;
    (path?.material as ShaderMaterial)?.dispose();

    this.bullet.geometry.dispose();
    bulletMaterial.map?.dispose();

    path?.geometry.dispose();
    bulletMaterial.dispose();
    this.bullet.clear();
  }
}
