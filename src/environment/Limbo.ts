import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { VolumetricFog } from '@/environment/VolumetricFog';
import type { Material } from 'three/src/materials/Material';

import type { Object3D } from 'three/src/core/Object3D';
import type { Assets } from '@/managers/AssetsLoader';
import type { Mesh } from 'three/src/objects/Mesh';
import type { Coords, Bounds } from '@/types.d';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { CSM } from 'three/examples/jsm/csm/CSM';
import GameScene from '@/environment/GameScene';

import Portals from '@/environment/Portals';
import Clouds from '@/environment/Clouds';
import Physics from '@/managers/physics';

import { min, max } from '@/utils/Array';
import { Color } from '@/utils/Color';
import Rain from '@/environment/Rain';
import { Config } from '@/config';

export default class Limbo extends GameScene
{
  private readonly rain = new Rain(this.renderer, this.scene);
  private readonly onResize = this.resize.bind(this);

  private readonly clouds = new Clouds(300);
  private readonly portals = new Portals();

  private controls?: OrbitControls;
  private fog?: VolumetricFog;
  private csm!: CSM;

  public constructor () {
    super();

    if (Config.freeCamera) {
      import('three/examples/jsm/controls/OrbitControls').then(Controls => {
        this.controls = new Controls.OrbitControls(this.camera, this.canvas);

        this.camera.position.set(0.0, 10.0, -50.0);
        this.controls.target.set(0.0, 0.0, 25.0);

        this.camera.lookAt(0, 0, 0);
        this.controls.update();
      });
    }

    this.camera.far = Config.Limbo.depth;
    this.createEnvironment();
    this.createEvents();
  }

  private async createEnvironment (): Promise<void> {
    !Config.freeCamera && import('@/environment/VolumetricFog').then(
      ({ VolumetricFog }) => {
        this.fog = new VolumetricFog();
        this.scene.fog = this.fog;
      }
    );

    const level = await this.loadLevel(Config.Limbo.model);
    level.position.copy(Config.Limbo.position as Vector3);
    level.scale.copy(Config.Limbo.scale as Vector3);

    this.createSkybox(Config.Limbo.skybox);
    this.createCascadedShadowMaps(level);

    this.scene.add(this.clouds.flash);
    this.scene.add(this.clouds.sky);
  }

  private createCascadedShadowMaps (level: Assets.GLTF): void {
    const direction = new Vector3(0.925, -1.875, -1.0).normalize();

    this.csm = new CSM({
      maxFar: this.camera.far * 10,
      lightDirection: direction,
      lightFar: this.camera.far,
      lightIntensity: 0.25,
      mode: 'logarithmic',
      camera: this.camera,
      parent: this.scene,
      cascades: 4,
      fade: true
    });

    this.csm.lights.forEach(light =>
      light.color.set(Color.MOON)
    );

    level.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as Material;

      if (childMesh.isMesh) {
        childMesh.renderOrder = 1;
        childMesh.receiveShadow = true;
        this.csm.setupMaterial(childMesh.material);

        if (this.fog) {
          material.onBeforeCompile = this.fog.setUniforms;
        }
      }
    });
  }

  private createEvents (): void {
    window.addEventListener('resize', this.onResize, false);
  }

  private resize (): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.csm.updateFrustums();
    this.rain.resize();
  }

  public createColliders (): void {
    const { position, height, sidewalkHeight } = Config.Limbo;
    Physics.createGround(Limbo.minCoords, Limbo.maxCoords);

    Physics.createBounds({
      borders: Limbo.bounds, y: position.y, height
    }, {
      borders: Config.Limbo.sidewalk as Bounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
    });
  }

  public outOfBounds (player: Vector3): Vector3 | null {
    return (
      this.portals.portalPassed(player) &&
      this.portals.playerPosition
    ) || null;
  }

  public removeObject (model: Object3D): void {
    this.scene.remove(model);
  }

  public addObject (model: Object3D): void {
    this.scene.add(model);
  }

  public override render (delta: number): void {
    this.rain.update(delta / 2);
    this.controls?.update();
    this.fog?.update(delta);

    this.clouds.update();
    this.csm.update();
    super.render();
  }

  public override destroy (): void {
    window.removeEventListener('resize', this.onResize, false);

    this.clouds.dispose();
    this.rain.dispose();
    this.csm.dispose();
    super.destroy();

    if (Config.DEBUG) {
      this.controls?.dispose();
      delete this.controls;
    }
  }

  public static get center (): Vector3 {
    return new Vector3(
      (Limbo.maxCoords[0] + Limbo.minCoords[0]) / 2.0,
      0.0,
      (Limbo.maxCoords[1] + Limbo.minCoords[1]) / 2.0
    );
  }

  public static get minCoords (): Coords {
    return [
      min(Limbo.bounds.map(coords => coords[0])),
      min(Limbo.bounds.map(coords => coords[1]))
    ];
  }

  public static get maxCoords (): Coords {
    return [
      max(Limbo.bounds.map(coords => coords[0])),
      max(Limbo.bounds.map(coords => coords[1]))
    ];
  }

  public static get portals (): Bounds {
    return Config.Limbo.portals as Bounds;
  }

  public static get bounds (): Bounds {
    return Config.Limbo.bounds as Bounds;
  }

  public static get size (): Vector2 {
    return new Vector2(
      Limbo.maxCoords[0] - Limbo.minCoords[0],
      Limbo.maxCoords[1] - Limbo.minCoords[1]
    );
  }

  public set pause (pause: boolean) {
    this.rain.pause = pause;
  }
}
