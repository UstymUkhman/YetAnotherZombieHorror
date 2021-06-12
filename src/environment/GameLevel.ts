import { ACESFilmicToneMapping, PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { CameraObject } from '@/managers/GameCamera';
import { Assets } from '@/managers/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';
import { Color } from '@/utils/Color';

export default class GameLevel
{
  protected readonly renderer = new WebGLRenderer({
    antialias: true,
    alpha: false
  });

  private readonly loader = new Assets.Loader();
  protected readonly camera = CameraObject;
  protected readonly scene = new Scene();

  public constructor () {
    this.createRenderer();
    this.createLight();
  }

  protected async loadLevel (file: string): Promise<Assets.GLTF> {
    const level = await this.loader.loadGLTF(file);
    this.scene.add(level.scene);
    return level.scene;
  }

  protected createSkybox (folder: string): void {
    this.loader.loadCubeTexture(folder).then(
      skybox => this.scene.background = skybox
    );
  }

  private createRenderer (): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1.0);
    this.renderer.setClearColor(Color.BLACK, 0.0);

    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.outputEncoding = sRGBEncoding;

    this.renderer.toneMappingExposure = 0.5;
    this.renderer.shadowMap.enabled = true;
  }

  private createLight (): void {
    this.scene.add(new AmbientLight(Color.WHITE, 0.5));
  }

  protected render (): void {
    this.renderer.render(this.scene, this.camera);
  }

  protected destroy (): void {
    this.renderer.dispose();
  }

  public get canvas (): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
