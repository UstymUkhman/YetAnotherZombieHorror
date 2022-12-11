import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { InstancedMesh } from 'three/src/objects/InstancedMesh';

import { PointLight } from 'three/src/lights/PointLight';
import { PI, random, randomInt } from '@/utils/Number';
import { Object3D } from 'three/src/core/Object3D';
import { GameEvents } from '@/events/GameEvents';

import { Matrix4 } from 'three/src/math/Matrix4';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/loaders/AssetsLoader';

import { Mesh } from 'three/src/objects/Mesh';
import LevelScene from '@/scenes/LevelScene';
import { Euler } from 'three/src/math/Euler';

import { Vector } from '@/utils/Vector';
import { Color } from '@/utils/Color';
import Settings from '@/settings';
import Configs from '@/configs';

export default class Clouds
{
  private readonly count = Settings.getPerformanceValue('clouds') as unknown as number;
  private readonly staticClouds = !Settings.getPerformanceValue('dynamicClouds');
  private readonly isLighting = Settings.getPerformanceValue('lighting');
  private readonly useFog = Settings.getPerformanceValue('fog');

  private readonly onShowLighting = this.showLighting.bind(this);
  private readonly onHideLighting = this.hideLighting.bind(this);

  private readonly rotation = new Euler(PI.d2, 0.0, 0.0);
  private readonly matrix = new Matrix4();

  private timeout!: NodeJS.Timeout;
  private clouds?: InstancedMesh;
  private lighting!: PointLight;
  private paused = true;

  public constructor () {
    this.isLighting && this.createLighting();
    this.createClouds();
  }

  private createLighting (): void {
    const decay = +(!this.useFog && Settings.getPerformanceValue('physicalLights')) + 1.0;

    this.lighting = new PointLight(Color.BLUE, 10.0, Clouds.height, decay);
    this.lighting.position.set(0.0, Clouds.height, 0.0);

    this.lighting.castShadow = true;
    this.lighting.power = 0.0;
  }

  private startLighting (): void {
    this.timeout = setTimeout(this.onShowLighting, 1e3 * (
      Math.random() * 15 + 15
    ));
  }

  private showLighting (): void {
    this.updateLightingPosition();
    this.lighting.power = 100 + Math.random() * 150;

    setTimeout(this.onHideLighting, Math.random() * 400 + 100);
    GameEvents.dispatch('SFX::Thunder', this.lighting.position, true);
  }

  private updateLightingPosition (): void {
    if (this.clouds) {
      this.clouds.getMatrixAt(randomInt(0, this.count - 1), this.matrix);
      this.lighting.position.setFromMatrixPosition(this.matrix);
    }

    else {
      this.lighting.position.set(
        random(LevelScene.minCoords[0], LevelScene.maxCoords[0]),
        Clouds.height / Configs.Level.height,
        random(LevelScene.minCoords[1], LevelScene.maxCoords[1])
      );
    }

    this.lighting.position.y -= Math.random() * (
      this.lighting.position.y / 4.0
    );
  }

  private hideLighting (): void {
    !this.paused && this.startLighting();
    this.lighting.power = 0.0;
  }

  private async createClouds (): Promise<void> {
    if (!this.count || (!this.isLighting && this.useFog)) return;

    const cloudsGeometry = new SphereGeometry(Clouds.height, 16, 16, 0, Math.PI);
    cloudsGeometry.parameters.phiLength = Math.PI;
    cloudsGeometry.rotateX(-PI.d2);

    const position = new Vector3();
    const cloud = new Object3D();

    this.clouds = new InstancedMesh(
      new PlaneGeometry(Clouds.height, Clouds.height),
      new MeshLambertMaterial({
        transparent: true,
        depthWrite: false,
        opacity: 0.25
      }),

      this.count
    );

    const sampler = new MeshSurfaceSampler(
      new Mesh(cloudsGeometry.toNonIndexed())
    ).build();

    for (let i = 0; i < this.count; i++) {
      sampler.sample(position);
      cloud.position.copy(position);

      cloud.lookAt(Vector.DOWN);
      cloud.updateMatrix();

      this.clouds.setMatrixAt(i, cloud.matrix);
    }

    this.clouds.position.copy(LevelScene.center);
    this.clouds.instanceMatrix.needsUpdate = true;

    (this.clouds.material as MeshLambertMaterial).map =
      await Assets.Loader.loadTexture(Configs.Level.cloud);
  }

  public update (): void {
    if (this.staticClouds || !this.clouds) return;

    for (let c = 0; c < this.count; c++) {
      const direction = c % 2 * 2 - 1;

      this.clouds.getMatrixAt(c, this.matrix);
      const matrix = this.matrix.clone();

      this.rotation.setFromRotationMatrix(matrix);
      this.rotation.z += Math.random() * direction * 0.002;
      this.matrix.makeRotationFromEuler(this.rotation);

      this.matrix.copyPosition(matrix);
      this.clouds.setMatrixAt(c, this.matrix);
    }

    this.clouds.instanceMatrix.needsUpdate = true;
  }

  public dispose (): void {
    const material = this.clouds?.material as MeshLambertMaterial;
    clearTimeout(this.timeout);
    material?.map?.dispose();

    this.lighting?.dispose();
    this.clouds?.dispose();
    material?.dispose();
  }

  public static get height (): number {
    return Math.max(LevelScene.size.x, LevelScene.size.y);
  }

  public set pause (pause: boolean) {
    !(this.paused = pause)
      ? this.isLighting && this.startLighting()
      : clearTimeout(this.timeout);
  }

  public get sky (): InstancedMesh {
    return this.clouds as InstancedMesh;
  }

  public get flash (): PointLight {
    return this.lighting;
  }
}
