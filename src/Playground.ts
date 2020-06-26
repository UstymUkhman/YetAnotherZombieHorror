// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="global.d.ts" />

import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { DirectionalLight } from '@three/lights/DirectionalLight';
import { WebGLRenderer } from '@three/renderers/WebGLRenderer';

import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { AmbientLight } from '@three/lights/AmbientLight';
import { OrbitControls } from '@controls/OrbitControls';
import { GridHelper } from '@three/helpers/GridHelper';
import { Material } from '@three/materials/Material';
import { WEBGL } from 'three/examples/jsm/WebGL';
import { Settings } from '@/utils/Settings';

import { Scene } from '@three/scenes/Scene';
import { Mesh } from '@three/objects/Mesh';
import { Fog } from '@three/scenes/Fog';
import { Color } from '@/utils/Color';

interface GridMaterial extends Material {
  transparent: boolean
  opacity: number
}

export default class Playground {
  private raf: number;
  private scene = new Scene();

  private renderer: WebGLRenderer;
  private controls: OrbitControls;

  private width: number = window.innerWidth;
  private height: number = window.innerHeight;
  private ratio: number = this.width / this.height;

  private camera = new PerspectiveCamera(45, this.ratio, 1, 500);
  private _onResize: EventListenerOrEventListenerObject = () => null;
  private stats: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

  public constructor () {
    const canvas = document.createElement('canvas');
    const glVersion = WEBGL.isWebGL2Available() ? '2' : '';

    const context = canvas.getContext(
      `webgl${glVersion}`, { antialias: true, alpha: false }
    ) as WebGLRenderingContext | WebGL2RenderingContext;

    if (!glVersion) {
      console.warn(`
        This environment does not seem to support WebGL 2.
        WebGL 1 will be used instead.
      `);
    }

    this.renderer = new WebGLRenderer({ canvas: canvas, context: context });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.createScene();
    this.createCamera();
    this.createLights();
    this.createGround();

    this.createRenderer();
    this.createControls();
    this.createEvents();

    if (Settings.DEBUG) {
      import(/* webpackChunkName: "stats.min" */ 'three/examples/js/libs/stats.min').then((Stats) => {
        this.stats = new Stats.default();
        this.createStats();
      });
    }

    this.raf = requestAnimationFrame(this.render.bind(this));
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

  private createControls (): void {
    this.controls.target.set(0, 0, 25);
    this.controls.update();
  }

  private createEvents (): void {
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize, false);
  }

  private createStats (): void {
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.domElement);
  }

  public getScene (): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public render (): void {
    this.stats?.begin();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.render.bind(this));

    this.stats?.end();
  }

  public onResize (): void {
    this.setSize();
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  public destroy (): void {
    window.removeEventListener('resize', this._onResize, false);
    cancelAnimationFrame(this.raf);

    if (this.stats !== null) {
      document.body.removeChild(this.stats.domElement);
      delete this.stats;
    }

    this.controls.dispose();
    this.renderer.dispose();
    this.scene.dispose();

    delete this.controls;
    delete this.renderer;
    delete this.camera;
    delete this.scene;
  }
}
