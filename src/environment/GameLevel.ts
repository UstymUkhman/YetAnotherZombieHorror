import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { WebGLRenderer } from '@three/renderers/WebGLRenderer';
import { Assets } from '@/managers/AssetsLoader';
import { Scene } from '@three/scenes/Scene';

export default class GameLevel {
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;
  private ratio: number = this.width / this.height;

  private renderer = new WebGLRenderer({ antialias: true, alpha: false });
  private _onResize: EventListenerOrEventListenerObject = () => null;
  protected camera = new PerspectiveCamera(45, this.ratio, 1, 500);

  private readonly loader = new Assets.Loader();
  protected readonly scene = new Scene();

  public constructor () {
    this.createRenderer();
    this.createEvents();
  }

  protected async loadLevel (file: string): Promise<Assets.GLTF> {
    const level = await this.loader.loadGLTF(file);
    this.scene.add(level.scene);
    return level.scene;
  }

  private createRenderer (): void {
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
  }

  private createEvents (): void {
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize, false);
  }

  private onResize (): void {
    this.setSize();
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  private setSize (): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.ratio = this.width / this.height;
  }

  protected render (): void {
    this.renderer.render(this.scene, this.camera);
  }

  protected destroy (): void {
    window.removeEventListener('resize', this._onResize, false);

    this.renderer.dispose();
    this.scene.dispose();

    delete this.renderer;
    delete this.camera;
  }

  public get canvas (): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
