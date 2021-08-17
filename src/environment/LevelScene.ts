import { ACESFilmicToneMapping, PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import type { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { LevelCoords, LevelBounds } from '@/environment/types';

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import type { VolumetricFog } from '@/environment/VolumetricFog';
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator';

import { AmbientLight } from 'three/src/lights/AmbientLight';
import { GameEvents, GameEvent } from '@/events/GameEvents';
import type { Texture } from 'three/src/textures/Texture';

import type { Object3D } from 'three/src/core/Object3D';
import type { Mesh } from 'three/src/objects/Mesh';
import { CameraObject } from '@/managers/Camera';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { CSM } from 'three/examples/jsm/csm/CSM';

import { Assets } from '@/loaders/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';

import Portals from '@/environment/Portals';
import Clouds from '@/environment/Clouds';

import { min, max } from '@/utils/Array';
import Settings from '@/config/settings';

import { Color } from '@/utils/Color';
import Rain from '@/environment/Rain';

import { Config } from '@/config';
import Physics from '@/physics';

export default class LevelScene
{
  private readonly clouds = new Clouds(300);
  private readonly renderer: WebGLRenderer;
  private readonly portals = new Portals();

  private readonly pmrem: PMREMGenerator;
  private readonly scene = new Scene();

  private fog?: VolumetricFog;
  private rain?: Rain;
  private csm?: CSM;

  public constructor (canvas: HTMLCanvasElement, pixelRatio: number) {
    this.renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: false,
      canvas
    });

    this.createColliders();
    this.createEnvironment();
    this.createRenderer(pixelRatio);

    this.pmrem = new PMREMGenerator(this.renderer);
    GameEvents.add('Level::AddModel', this.addModel.bind(this));
    GameEvents.add('Level::RemoveModel', this.removeModel.bind(this));
  }

  private createColliders (): void {
    const { position, height, sidewalkHeight } = Config.Level;
    Physics.createGround(LevelScene.minCoords, LevelScene.maxCoords);

    Physics.createBounds({
      borders: LevelScene.bounds, y: position.y, height
    }, {
      borders: Config.Level.sidewalk as LevelBounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
    });
  }

  private async createEnvironment (): Promise<void> {
    if (Settings.raining) {
      this.rain = new Rain(this.renderer, this.scene);
    }

    Settings.fog && import('@/environment/VolumetricFog').then(
      ({ VolumetricFog }) => {
        this.fog = new VolumetricFog();
        this.scene.fog = this.fog;
      }
    );

    const skyboxMap = await this.createSkybox(Config.Level.skybox);
    const level = await this.loadLevel(Config.Level.model);

    level.position.copy(Config.Level.position as Vector3);
    level.scale.copy(Config.Level.scale as Vector3);

    this.scene.add(this.clouds.flash);
    this.scene.add(this.clouds.sky);
    this.createLights();

    level.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        childMesh.renderOrder = 1;
        material.envMap = skyboxMap;

        childMesh.receiveShadow = true;
        this.csm?.setupMaterial(childMesh.material);

        if (this.fog) {
          material.onBeforeCompile = this.fog.setUniforms;
        }
      }
    });

    const envMap = this.getSceneEnvMap().clone();
    GameEvents.dispatch('Level::EnvMap', envMap);
  }

  private async loadLevel (file: string): Promise<Assets.GLTF> {
    const level = await Assets.Loader.loadGLTF(file);
    this.scene.add(level.scene);
    return level.scene;
  }

  private async createSkybox (folder: string): Promise<Texture> {
    const skybox = await Assets.Loader.loadCubeTexture(folder);

    skybox.encoding = sRGBEncoding;
    this.scene.background = skybox;

    this.pmrem.compileCubemapShader();
    return this.pmrem.fromCubemap(skybox).texture;
  }

  private createLights (): void {
    this.scene.add(new AmbientLight(Color.WHITE, 0.1));
    const direction = new Vector3(0.925, -1.875, -1.0).normalize();

    this.csm = new CSM({
      maxFar: CameraObject.far * 10,
      lightFar: CameraObject.far,
      lightDirection: direction,

      camera: CameraObject,
      lightIntensity: 0.25,
      mode: 'logarithmic',

      parent: this.scene,
      cascades: 4,
      fade: true
    });

    this.csm.lights.forEach(light =>
      light.color.set(Color.MOON)
    );
  }

  private getSceneEnvMap (): Texture {
    return this.pmrem.fromScene(
      this.scene, 0.0,
      CameraObject.near,
      CameraObject.far
    ).texture;
  }

  private createRenderer (pixelRatio: number): void {
    const exposure = +Config.worker * 0.5 + 0.5;

    this.renderer.physicallyCorrectLights = Config.worker;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.renderer.setClearColor(Color.BLACK, 0.0);
    this.renderer.toneMappingExposure = exposure;
    this.renderer.outputEncoding = sRGBEncoding;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  public removeModel (event: GameEvent): void {
    const model = event.data as Object3D;
    this.scene.remove(model);
  }

  private addModel (event: GameEvent): void {
    const model = event.data as Object3D;
    this.scene.add(model);
  }

  public render (delta: number): void {
    this.renderer.render(this.scene, CameraObject);

    this.rain?.update(delta);
    this.fog?.update(delta);

    this.clouds.update();
    this.csm?.update();
  }

  public resize (width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.rain?.resize(width, height);
    this.csm?.updateFrustums();
  }

  public outOfBounds (player: Vector3): Vector3 | null {
    return (
      this.portals.portalPassed(player) &&
      this.portals.playerPosition
    ) || null;
  }

  public dispose (): void {
    GameEvents.remove('Level::AddModel');
    GameEvents.remove('Level::RemoveModel');

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.renderer.dispose();
    this.clouds.dispose();
    this.rain?.dispose();
    this.csm?.dispose();
    this.fog?.dispose();
  }

  public static get maxCoords (): LevelCoords {
    return [
      max(LevelScene.bounds.map(coords => coords[0])),
      max(LevelScene.bounds.map(coords => coords[1]))
    ];
  }

  public static get minCoords (): LevelCoords {
    return [
      min(LevelScene.bounds.map(coords => coords[0])),
      min(LevelScene.bounds.map(coords => coords[1]))
    ];
  }

  public static get portals (): LevelBounds {
    return Config.Level.portals as LevelBounds;
  }

  public static get center (): Vector3 {
    return new Vector3(
      (LevelScene.maxCoords[0] + LevelScene.minCoords[0]) / 2.0,
      0.0,
      (LevelScene.maxCoords[1] + LevelScene.minCoords[1]) / 2.0
    );
  }

  public static get bounds (): LevelBounds {
    return Config.Level.bounds as LevelBounds;
  }

  public static get size (): Vector2 {
    return new Vector2(
      LevelScene.maxCoords[0] - LevelScene.minCoords[0],
      LevelScene.maxCoords[1] - LevelScene.minCoords[1]
    );
  }

  public set pause (pause: boolean) {
    this.clouds.pause = pause;
  }
}
