import { PCFSoftShadowMap, ReinhardToneMapping } from '@three/constants';
import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { PerspectiveCamera } from '@three/cameras/PerspectiveCamera';
import { DirectionalLight } from '@three/lights/DirectionalLight';
import { WebGLRenderer } from '@three/renderers/WebGLRenderer';

import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { AudioListener } from '@three/audio/AudioListener';
import { AmbientLight } from '@three/lights/AmbientLight';
import { GridHelper } from '@three/helpers/GridHelper';

import { Scene } from '@three/scenes/Scene';
import { Mesh } from '@three/objects/Mesh';
import { Color } from '@three/math/Color';
import { Fog } from '@three/scenes/Fog';

const GROUND = 0x888888;
const WHITE = 0xFFFFFF;
const FOG = 0xA0A0A0;

export default class Playground {
  constructor () {
    this.setSize();

    this.createScene();
    this.createCamera();
    this.createLights();
    this.createGround();

    this.createListener();
    this.createRenderer();
    this.createEvents();
  }

  setSize () {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.ratio = this.width / this.height;
  }

  createScene () {
    this.scene = new Scene();
    this.scene.fog = new Fog(FOG, 1, 33);
    this.scene.background = new Color(FOG);
  }

  createCamera () {
    this.camera = new PerspectiveCamera(45, this.ratio, 0.1, 1000);
    this.camera.position.set(-1.1, 2.75, -2.5);
    this.camera.rotation.set(0, Math.PI, 0);
    this.camera.setFocalLength(25.0);
    window.camera = this.camera;
  }

  createLights () {
    const directional = new DirectionalLight(WHITE, 0.8);
    const ambient = new AmbientLight(WHITE);

    directional.shadow.mapSize.height = 8192;
    directional.shadow.mapSize.width = 8192;
    directional.shadow.mapSize.x = 8192;
    directional.shadow.mapSize.y = 8192;

    directional.shadow.camera.bottom = -50;
    directional.shadow.camera.right = 50;
    directional.shadow.camera.left = -50;
    directional.shadow.camera.top = 50;

    directional.shadow.camera.far = 100;
    directional.shadow.camera.near = 1;

    directional.position.set(0, 10, -50);
    directional.castShadow = true;

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  createGround () {
    const ground = new Mesh(
      new BoxGeometry(100, 100, 1),
      new MeshPhongMaterial({
        depthWrite: false,
        color: GROUND
      })
    );

    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    ground.position.y = -0.5;
    this.scene.add(ground);
  }

  createGrid () {
    this.scene.remove(this.scene.getObjectByName('grid'));
    const grid = new GridHelper(100, 50, 0, 0);

    grid.material.transparent = true;
    grid.material.opacity = 0.25;

    grid.position.y = 0.0;
    this.scene.add(grid);
    grid.name = 'grid';
  }

  createListener () {
    const listener = new AudioListener();
    this.camera.add(listener);
  }

  createRenderer () {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(FOG, 1.0);

    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.enabled = true;

    this.renderer.toneMapping = ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    document.body.appendChild(this.renderer.domElement);
  }

  createEvents () {
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize, false);
  }

  fadeIn () {
    this.renderer.domElement.style.opacity = 1;
    this.render();
  }

  render () {
    this.renderer.render(this.scene, this.camera);
  }

  onResize () {
    this.setSize();
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  dispose () {
    window.removeEventListener('resize', this._onResize, false);
    document.body.removeChild(this.renderer.domElement);
    const children = this.scene.children;

    for (let c = 0; c < children.length; c++) {
      this.scene.remove(children[c]);
    }

    delete this.camera.children[0];
    delete this.renderer;
    delete this.camera;
    delete this.scene;
  }

  static get bounds () {
    return {
      front: 49,
      side: 49
    };
  }
}
