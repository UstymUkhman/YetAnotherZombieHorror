import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import type { Material } from 'three/src/materials/Material';

import { AmbientLight } from 'three/src/lights/AmbientLight';
import { GameEvents, GameEvent } from '@/events/GameEvents';
import { GridHelper } from 'three/src/helpers/GridHelper';
import Camera, { CameraObject } from '@/managers/Camera';
import Stats from 'three/examples/jsm/libs/stats.module';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import { Texture } from 'three/src/textures/Texture';

import { Scene } from 'three/src/scenes/Scene';
import { Mesh } from 'three/src/objects/Mesh';
import { Clock } from 'three/src/core/Clock';
import { Fog } from 'three/src/scenes/Fog';
import Pointer from '@/managers/Pointer';
import Player from '@/characters/Player';
import Viewport from '@/utils/Viewport';
import { Color } from '@/utils/Color';
import Pistol from '@/weapons/Pistol';

import Controls from '@/controls';
import RAF from '@/managers/RAF';
import Physics from '@/physics';
import Configs from '@/configs';

interface GridMaterial extends Material {
  transparent: boolean
  opacity: number
}

const ORBIT_CONTROLS = false;

export default class Sandbox
{
  private stats?: Stats;
  private controls?: Controls;
  private orbit?: OrbitControls;
  private camera!: PerspectiveCamera;

  private readonly clock = new Clock();
  private readonly scene = new Scene();
  private readonly player = new Player();
  private readonly envMap = new Texture();
  private readonly pointer = new Pointer();

  // private readonly enemy = new Enemy(this.envMap);
  private readonly update = this.render.bind(this);
  private readonly pistol = new Pistol(this.envMap);
  private readonly onResize = this.resize.bind(this);
  private readonly onPointerLock = this.requestPointerLock.bind(this);
  private readonly renderer = new WebGLRenderer({ antialias: true, alpha: false });

  public constructor () {
    this.createScene();
    this.createCamera();
    this.createLights();
    this.createGround();
    this.createPlayer();

    this.createRenderer();
    this.createControls();
    this.addColliders();
    this.createStats();
    this.addEvents();
  }

  private createScene (): void {
    this.scene.background = Color.getClass(Color.WHITE);
    this.scene.fog = new Fog(Color.WHITE, ORBIT_CONTROLS ? 10 : 0.1, 50);
  }

  private createCamera (): void {
    const ratio = innerWidth / innerHeight;
    this.camera = new PerspectiveCamera(45, ratio, 0.1, 500);
    this.camera.position.set(2.5, 1.7, 30);
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

    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 50;

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  private createGround (): void {
    const ground = new Mesh(
      new BoxGeometry(500, 500, 1),
      new MeshPhongMaterial({
        color: Color.WHITE,
        depthWrite: false
      })
    );

    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new GridHelper(500, 250, 0, 0);
    (grid.material as GridMaterial).transparent = true;
    (grid.material as GridMaterial).opacity = 0.25;
    this.scene.add(grid);
  }

  private createPlayer (): void {
    this.player.loadCharacter(this.envMap).then(() => {
      this.player.setPistol([]/* this.enemy.hitBox */, this.pistol);
      Physics.setCharacter(this.player.collider, 90);

      Physics.pause = false;
      RAF.add(this.update);
      RAF.pause = false;
    });
  }

  private createRenderer (): void {
    document.body.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(innerWidth, innerHeight);

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(Color.PORTAL, 1);

    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
  }

  private createControls (): void {
    if (!ORBIT_CONTROLS) this.controls = new Controls(this.player);

    else {
      this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
      this.orbit.update();
    }
  }

  private addColliders (): void {
    const { position, height } = Configs.Level;
    Physics.createGround([-250.0, -250.0], [250.0, 250.0]);

    Physics.createBounds({
      height,
      y: position.y,
      borders: [
        [-250.0,  250.0],
        [ 250.0,  250.0],
        [ 250.0, -250.0],
        [-250.0, -250.0]
      ]
    });
  }

  private createStats (): void {
    if (document.body.lastElementChild?.id !== 'stats') {
      this.stats = Stats();
      this.stats.showPanel(0);

      this.stats.domElement.style.left = 'auto';
      this.stats.domElement.style.right = '0px';
      document.body.appendChild(this.stats.domElement);
    }
  }

  private addEvents (): void {
    Viewport.addResizeCallback(this.onResize);
    document.body.addEventListener('click', this.onPointerLock);
    GameEvents.add('Level::AddObject', this.addGameObject.bind(this));
    GameEvents.add('Level::RemoveObject', this.removeGameObject.bind(this));
    GameEvents.add('Game::Pause', this.toggleControls.bind(this, false));
  }

  private requestPointerLock (): void {
    if (!this.controls) return;
    this.pointer.requestPointerLock();
    this.toggleControls(true);
  }

  private addGameObject (event: GameEvent): void {
    const object = event.data as Object3D;
    this.scene.add(object);
  }

  private removeGameObject (event: GameEvent): void {
    const object = event.data as Object3D;
    this.scene.remove(object);
  }

  private updateCharacters (player: Vector3, delta: number): void {
    this.player.update(delta);
    // this.enemy.update(delta, player);
  }

  private updateGameObjects (player: Vector3): void {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.updateCharacters(player, delta);
    Physics.update(delta);
    Camera.updateState();
  }

  private toggleControls (enable: boolean) {
    if (!this.controls) return;
    this.controls.pause = !enable;
  }

  private removeEvents (): void {
    document.body.removeEventListener('click', this.onPointerLock);
    Viewport.removeResizeCallback(this.onResize);
    GameEvents.remove('Level::RemoveObject');
    GameEvents.remove('Level::AddObject');
    GameEvents.remove('Game::Pause');
  }

  private render (): void {
    this.stats?.begin();

    this.updateGameObjects(this.player.location.position);
    if (!this.orbit) this.renderer.render(this.scene, CameraObject);

    else {
      this.orbit.update();
      this.renderer.render(this.scene, this.camera);
    }

    this.stats?.end();
  }

  private resize (): void {
    if (!this.orbit) Camera.resize();

    else {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    }
  }

  public dispose (): void {
    RAF.remove(this.update);

    this.controls?.dispose();
    this.renderer.dispose();
    this.pointer.dispose();
    this.orbit?.dispose();
    this.player.dispose();
    // this.enemy.dispose();

    this.removeEvents();
    this.scene.clear();
    Physics.dispose();
    Camera.dispose();
    RAF.dispose();

    this.stats?.domElement.remove();
    this.renderer.domElement.remove();
  }
}
