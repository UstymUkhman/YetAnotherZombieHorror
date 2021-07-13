import { ACESFilmicToneMapping, PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import type { VolumetricFog } from '@/environment/VolumetricFog';
import type { Material } from 'three/src/materials/Material';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import type { Object3D } from 'three/src/core/Object3D';
import { CameraObject } from '@/managers/GameCamera';
import type { Mesh } from 'three/src/objects/Mesh';
import { Assets } from '@/managers/AssetsLoader';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { CSM } from 'three/examples/jsm/csm/CSM';
import type { Coords, Bounds } from '@/types.d';
import { Scene } from 'three/src/scenes/Scene';

import Portals from '@/environment/Portals';
import Clouds from '@/environment/Clouds';
import { min, max } from '@/utils/Array';
import Settings from '@/config/settings';
import Physics from '@/managers/physics';

import Viewport from '@/utils/Viewport';
import { Color } from '@/utils/Color';
import Rain from '@/environment/Rain';
import { Config } from '@/config';

export default class GameLevel
{
  private readonly onResize = this.resize.bind(this);

  private readonly renderer = new WebGLRenderer({
    preserveDrawingBuffer: true,
    antialias: true,
    alpha: false
  });

  private readonly loader = new Assets.Loader();
  private readonly clouds = new Clouds(300);
  private readonly portals = new Portals();

  private readonly camera = CameraObject;
  private readonly scene = new Scene();

  private controls?: OrbitControls;
  private fog?: VolumetricFog;

  private rain?: Rain;
  private csm!: CSM;

  public constructor () {
    Config.freeCamera && import('three/examples/jsm/controls/OrbitControls').then(Controls => {
      this.controls = new Controls.OrbitControls(
        this.camera, this.renderer.domElement
      );

      this.camera.position.set(0.0, 10.0, -50.0);
      this.controls.target.set(0.0, 0.0, 25.0);

      this.camera.lookAt(0, 0, 0);
      this.controls.update();
    });

    Viewport.addResizeCallback(this.onResize);
    this.camera.far = Config.Level.depth;

    this.createEnvironment();
    this.createRenderer();
  }

  private async createEnvironment (): Promise<void> {
    if (Settings.raining) {
      this.rain = new Rain(this.renderer, this.scene);
    }

    !Config.freeCamera && import('@/environment/VolumetricFog').then(
      ({ VolumetricFog }) => {
        this.fog = new VolumetricFog();
        this.scene.fog = this.fog;
      }
    );

    const level = await this.loadLevel(Config.Level.model);
    level.position.copy(Config.Level.position as Vector3);
    level.scale.copy(Config.Level.scale as Vector3);

    this.createSkybox(Config.Level.skybox);
    this.scene.add(this.clouds.flash);
    this.scene.add(this.clouds.sky);
    this.createLights();

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

  private async loadLevel (file: string): Promise<Assets.GLTF> {
    const level = await this.loader.loadGLTF(file);
    this.scene.add(level.scene);
    return level.scene;
  }

  private createSkybox (folder: string): void {
    this.loader.loadCubeTexture(folder).then(
      skybox => this.scene.background = skybox
    );
  }

  private createLights (): void {
    this.scene.add(new AmbientLight(Color.WHITE, 0.1));
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
  }

  private createRenderer (): void {
    this.renderer.setSize(Viewport.size.width, Viewport.size.height);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1.0);

    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(Color.BLACK, 0.0);

    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMappingExposure = 0.575;
    this.renderer.shadowMap.enabled = true;
  }

  public render (delta: number): void {
    this.renderer.render(this.scene, this.camera);
    this.controls && this.controls.update();

    this.rain?.update(delta);
    this.fog?.update(delta);

    this.clouds.update();
    this.csm.update();
  }

  private resize (width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.rain?.resize(width, height);
    this.csm?.updateFrustums();
  }

  public createColliders (): void {
    const { position, height, sidewalkHeight } = Config.Level;
    Physics.createGround(GameLevel.minCoords, GameLevel.maxCoords);

    Physics.createBounds({
      borders: GameLevel.bounds, y: position.y, height
    }, {
      borders: Config.Level.sidewalk as Bounds,
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

  public destroy (): void {
    Viewport.removeResizeCallback(this.onResize);

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    if (Config.DEBUG) {
      this.controls?.dispose();
      delete this.controls;
    }

    this.renderer.dispose();
    this.clouds.dispose();
    this.rain?.dispose();
    this.csm?.dispose();
    this.fog?.dispose();
  }

  public get scenes (): Array<HTMLCanvasElement> {
    const scene = this.renderer.domElement;

    return !Settings.raindrops ? [scene] : [
      this.rain?.cameraDrops as HTMLCanvasElement, scene
    ];
  }

  public static get maxCoords (): Coords {
    return [
      max(GameLevel.bounds.map(coords => coords[0])),
      max(GameLevel.bounds.map(coords => coords[1]))
    ];
  }

  public static get minCoords (): Coords {
    return [
      min(GameLevel.bounds.map(coords => coords[0])),
      min(GameLevel.bounds.map(coords => coords[1]))
    ];
  }

  public static get portals (): Bounds {
    return Config.Level.portals as Bounds;
  }

  public static get center (): Vector3 {
    return new Vector3(
      (GameLevel.maxCoords[0] + GameLevel.minCoords[0]) / 2.0,
      0.0,
      (GameLevel.maxCoords[1] + GameLevel.minCoords[1]) / 2.0
    );
  }

  public static get bounds (): Bounds {
    return Config.Level.bounds as Bounds;
  }

  public static get size (): Vector2 {
    return new Vector2(
      GameLevel.maxCoords[0] - GameLevel.minCoords[0],
      GameLevel.maxCoords[1] - GameLevel.minCoords[1]
    );
  }

  public set pause (pause: boolean) {
    if (this.rain) this.rain.pause = pause;
    this.clouds.pause = pause;
  }
}
