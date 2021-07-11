import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';

import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';
import { InstancedMesh } from 'three/src/objects/InstancedMesh';

import { PointLight } from 'three/src/lights/PointLight';
import { CameraListener } from '@/managers/GameCamera';
import { Object3D } from 'three/src/core/Object3D';

import { Matrix4 } from 'three/src/math/Matrix4';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/managers/AssetsLoader';

import GameLevel from '@/environment/GameLevel';
import { PI, randomInt } from '@/utils/Number';
import { Mesh } from 'three/src/objects/Mesh';
import { Euler } from 'three/src/math/Euler';

import Settings from '@/config/settings';
import { Vector } from '@/utils/Vector';
import { Color } from '@/utils/Color';
import { Config } from '@/config';
import anime from 'animejs';

export default class Clouds
{
  private readonly onShowLighting = this.showLighting.bind(this);
  private readonly onHideLighting = this.hideLighting.bind(this);

  private readonly rotation = new Euler(PI.d2, 0.0, 0.0);
  private readonly loader = new Assets.Loader();
  private readonly matrix = new Matrix4();
  private readonly radius = Clouds.height;

  private clouds!: InstancedMesh;
  private lighting!: PointLight;
  private paused = true;

  public constructor (private readonly count: number) {
    this.createLighting();
    this.createClouds();
  }

  private async createLighting (): Promise<void> {
    this.lighting = new PointLight(Color.BLUE, 10, this.radius, 2.5);
    this.lighting.position.set(0.0, this.radius, 0.0);
    this.addSounds(await this.loadLightingSounds());

    this.lighting.castShadow = true;
    this.lighting.power = 0.0;
    this.startLighting();
  }

  private async loadLightingSounds (): Promise<Array<AudioBuffer>> {
    return await Promise.all(Config.Level.lighting.map(
        this.loader.loadAudio.bind(this.loader)
      )
    );
  }

  private addSounds (sounds: Array<AudioBuffer>): void {
    sounds.forEach(sound => {
      const audio = new PositionalAudio(CameraListener);

      audio.setBuffer(sound);
      this.lighting.add(audio);
    });
  }

  private startLighting (): void {
    setTimeout(this.onShowLighting, 1e3 * (
      Math.random() * 15 + 15
    ));
  }

  private showLighting (): void {
    this.clouds.getMatrixAt(randomInt(0, this.count - 1), this.matrix);
    this.lighting.position.setFromMatrixPosition(this.matrix);

    setTimeout(this.onHideLighting, Math.random() * 400 + 100);
    this.lighting.power = 100 + Math.random() * 150;

    this.lighting.position.y -= Math.random() * (
      this.lighting.position.y / 4.0
    );

    this.startThunder(this.lighting.position);
  }

  private startThunder (position: Vector3): void {
    const distance = position.distanceToSquared(CameraListener.position);
    const audioIndex = randomInt(0, this.lighting.children.length - 1);

    const thunder = this.lighting.children[audioIndex] as PositionalAudio;
    const duration = (thunder.buffer?.duration ?? 0) * 1e3;

    thunder.setRefDistance(distance / Config.Level.depth);
    thunder.setVolume(+!this.paused);
    thunder.play();

    setTimeout(() => anime({
      targets: { volume: thunder?.getVolume() },
      complete: () => thunder?.stop(),

      update: ({ animations }) => thunder?.setVolume(
        +animations[0].currentValue
      ),

      easing: 'linear',
      duration: 500,
      volume: 0.0
    }), duration - 500);
  }

  private hideLighting (): void {
    this.lighting.power = 0.0;
    this.startLighting();
  }

  private async createClouds (): Promise<void> {
    const cloudsGeometry = new SphereGeometry(this.radius, 16, 16, 0, Math.PI);
    cloudsGeometry.parameters.phiLength = Math.PI;
    cloudsGeometry.rotateX(-PI.d2);

    const position = new Vector3();
    const cloud = new Object3D();

    this.clouds = new InstancedMesh(
      new PlaneGeometry(this.radius, this.radius),
      new MeshLambertMaterial({
        transparent: true,
        depthWrite: false,
        opacity: 0.25,
        fog: false
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

    (this.clouds.material as MeshLambertMaterial).map =
      await this.loader.loadTexture(Config.Level.cloud);

    this.clouds.instanceMatrix.needsUpdate = true;
    this.clouds.position.copy(GameLevel.center);
  }

  public update (): void {
    if (!Settings.dynamicClouds) return;

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
    this.lighting.remove();
    this.clouds.dispose();
  }

  public static get height (): number {
    return Math.max(GameLevel.size.x, GameLevel.size.y);
  }

  public set pause (pause: boolean) {
    this.paused = pause;
  }

  public get sky (): InstancedMesh {
    return this.clouds;
  }

  public get flash (): PointLight {
    return this.lighting;
  }
}
