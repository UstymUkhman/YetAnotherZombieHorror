import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { DirectionalLight } from '@three/lights/DirectionalLight';
import { WebGLRenderer } from '@three/renderers/WebGLRenderer';

import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { AmbientLight } from '@three/lights/AmbientLight';
import { GridHelper } from '@three/helpers/GridHelper';
import { Material } from '@three/materials/Material';

import { Scene } from '@three/scenes/Scene';
import { Mesh } from '@three/objects/Mesh';
import { Fog } from '@three/scenes/Fog';
import { Color } from '@/utils/Color';

interface GridMaterial extends Material {
  transparent: boolean
  opacity: number
}

export default class GameLevel {
  protected readonly scene = new Scene();

  private width: number = window.innerWidth;
  private height: number = window.innerHeight;
  private ratio: number = this.width / this.height;

  protected camera = new PerspectiveCamera(45, this.ratio, 1, 500);
  private _onResize: EventListenerOrEventListenerObject = () => null;
  private renderer = new WebGLRenderer({ antialias: true, alpha: false });

  public constructor () {
    this.createScene();
    this.createCamera();
    this.createLights();
    this.createGround();

    this.createRenderer();
    this.createEvents();
  }

  private setSize (): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.ratio = this.width / this.height;
  }

  private createScene (): void {
    this.scene.background = Color.getClass(Color.GREY);
    this.scene.fog = new Fog(Color.GREY, 50, 500);
  }

  private createCamera (): void {
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(0, 0, 0);
  }

  private createLights (): void {
    const directional = new DirectionalLight(Color.WHITE, 1);
    const ambient = new AmbientLight(Color.WHITE);

    directional.position.set(-5, 10, 15);
    directional.castShadow = true;

    directional.shadow.camera.bottom = -25;
    directional.shadow.camera.right = 25;
    directional.shadow.camera.left = -25;
    directional.shadow.camera.top = 15;

    directional.shadow.mapSize.x = 1024;
    directional.shadow.mapSize.y = 1024;

    directional.shadow.camera.near = 2;
    directional.shadow.camera.far = 50;

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  private createGround (): void {
    const ground = new Mesh(
      new BoxGeometry(500, 500, 1),
      new MeshPhongMaterial({
        color: Color.GROUND,
        depthWrite: false
      })
    );

    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new GridHelper(500, 50, 0, 0);
    (grid.material as GridMaterial).transparent = true;
    (grid.material as GridMaterial).opacity = 0.2;
    this.scene.add(grid);
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
