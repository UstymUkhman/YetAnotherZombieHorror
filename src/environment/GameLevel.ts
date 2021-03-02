import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { CameraObject } from '@/managers/GameCamera';
import { Assets } from '@/managers/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';

export default class GameLevel {
  private renderer = new WebGLRenderer({ antialias: true, alpha: false });
  private readonly onResize = this.setRenderSize.bind(this);

  private readonly loader = new Assets.Loader();
  protected readonly scene = new Scene();
  protected camera = CameraObject;

  public constructor () {
    this.createRenderer();
    this.createEvents();
  }

  protected async loadLevel (file: string): Promise<Assets.GLTF> {
    const level = await this.loader.loadGLTF(file);
    this.scene.add(level.scene);
    return level.scene;
  }

  protected createSkybox (folder: string): void {
    this.loader.loadCubeTexture(folder)
      .then(skybox => this.scene.background = skybox);
  }

  private createRenderer (): void {
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.shadowMap.enabled = false;
    this.setRenderSize();
  }

  private setRenderSize (): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private createEvents (): void {
    window.addEventListener('resize', this.onResize, false);
  }

  protected render (): void {
    this.renderer.render(this.scene, this.camera);
  }

  protected destroy (): void {
    window.removeEventListener('resize', this.onResize, false);
    this.renderer.dispose();
  }

  public get canvas (): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
