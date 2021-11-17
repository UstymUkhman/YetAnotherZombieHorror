import { ACESFilmicToneMapping, PCFSoftShadowMap, FrontSide, sRGBEncoding } from 'three/src/constants';
import type { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { LevelCoords, LevelBounds } from '@/environment/types';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
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

import type WebWorker from '@/worker/WebWorker';
import { Assets } from '@/loaders/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';

import Portals from '@/environment/Portals';
import Clouds from '@/environment/Clouds';
import { min, max } from '@/utils/Array';

import { Color } from '@/utils/Color';
import Rain from '@/environment/Rain';
import Fog from '@/environment/Fog';

import Physics from '@/physics';
import Configs from '@/configs';

export default class LevelScene
{
  private readonly renderer: WebGLRenderer;
  private readonly portals = new Portals();
  private readonly clouds = new Clouds();

  private readonly pmrem: PMREMGenerator;
  private readonly scene = new Scene();

  private rain?: Rain;
  private csm?: CSM;
  private fog?: Fog;

  public constructor (canvas: HTMLCanvasElement, pixelRatio: number, worker?: WebWorker) {
    this.renderer = new WebGLRenderer({
      preserveDrawingBuffer: Configs.Settings.raindrops,
      antialias: true,
      alpha: false,
      canvas
    });

    this.createColliders();
    this.createEnvironment(worker);
    this.createRenderer(pixelRatio);

    this.pmrem = new PMREMGenerator(this.renderer);
    GameEvents.add('Level::AddObject', this.addGameObject.bind(this));
    GameEvents.add('Level::RemoveObject', this.removeGameObject.bind(this));
  }

  private createColliders (): void {
    const { position, height, sidewalkHeight } = Configs.Level;
    Physics.createGround(LevelScene.minCoords, LevelScene.maxCoords);

    Physics.createBounds({
      borders: LevelScene.bounds, y: position.y, height
    }, {
      borders: Configs.Level.sidewalk as LevelBounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
    });
  }

  private async createEnvironment (worker?: WebWorker): Promise<void> {
    const { fog, raining, lighting } = Configs.Settings;
    const volumetricFog = fog && Configs.Settings.volumetricFog;

    const skyboxMap = await this.createSkybox(Configs.Level.skybox);
    const level = await this.loadLevel(Configs.Level.model);

    level.position.copy(Configs.Level.position as Vector3);
    level.scale.copy(Configs.Level.scale as Vector3);
    lighting && this.scene.add(this.clouds.flash);

    if (raining) {
      this.rain = new Rain(this.renderer, this.scene, worker);
    }

    if (fog) {
      this.fog = new Fog(volumetricFog);
      this.scene.fog = this.fog;

      this.scene.background = Color.getClass(Color.FOG);
      volumetricFog && this.portals.setFogUniforms(this.fog.setUniforms);
    }

    else this.scene.add(this.clouds.sky);

    this.createLights();

    level.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        material.opacity = 1.0;
        material.alphaTest = 1.0;

        material.side = FrontSide;
        material.envMap = skyboxMap;

        childMesh.renderOrder = 1.0;
        childMesh.receiveShadow = true;
        this.csm?.setupMaterial(childMesh.material);

        if (this.fog && volumetricFog) {
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

    if (!Configs.Settings.fog) {
      this.scene.background = skybox;
    }

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
    const { physicalLights } = Configs.Settings;
    const exposure = +physicalLights * 0.75 + 0.25;

    this.renderer.physicallyCorrectLights = physicalLights;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.renderer.setClearColor(Color.BLACK, 0.0);
    this.renderer.toneMappingExposure = exposure;
    this.renderer.outputEncoding = sRGBEncoding;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  private removeGameObject (event: GameEvent): void {
    const model = event.data as Object3D;
    this.scene.remove(model);
  }

  private addGameObject (event: GameEvent): void {
    const model = event.data as Object3D;
    this.scene.add(model);
  }

  public render (delta: number): void {
    this.renderer.render(this.scene, CameraObject);

    this.portals.update(delta);
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
    GameEvents.remove('Level::AddObject');
    GameEvents.remove('Level::RemoveObject');

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
    return Configs.Level.portals as LevelBounds;
  }

  public static get bounds (): LevelBounds {
    return Configs.Level.bounds as LevelBounds;
  }

  public static get center (): Vector3 {
    return new Vector3(
      (LevelScene.maxCoords[0] + LevelScene.minCoords[0]) / 2.0,
      0.0,
      (LevelScene.maxCoords[1] + LevelScene.minCoords[1]) / 2.0
    );
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
