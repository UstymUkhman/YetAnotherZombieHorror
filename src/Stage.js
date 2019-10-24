import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { GridHelper } from 'three/src/helpers/GridHelper';

import { Scene } from 'three/src/scenes/Scene';
import { Mesh } from 'three/src/objects/Mesh';
import { Color } from 'three/src/math/Color';
import { Fog } from 'three/src/scenes/Fog';

const GROUND = 0x888888;
const WHITE = 0xFFFFFF;
const FOG = 0xA0A0A0;

export default class Playground {
  constructor (free = true) {
    this.setSize();

    this.createScene();
    this.createCamera(free);
    this.createLights();
    this.createGround();

    this.createRenderer();
    this.createEvents();

    if (free) {
      this.createControls();
    }
  }

  setSize () {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.ratio = this.width / this.height;
  }

  createScene () {
    this.scene = new Scene();
    this.scene.background = new Color(FOG);
    this.scene.fog = new Fog(FOG, 1, 50);
  }

  createCamera (free = false) {
    this.camera = new PerspectiveCamera(45, this.ratio, 0.1, 1000);

    if (!free) {
      this.camera.rotation.set(0, Math.PI, 0);
      this.camera.position.set(-1.25, 3, -3);
      this.camera.setFocalLength(25.0);
    } else {
      this.camera.position.set(0, 3.5, -5);
      this.camera.lookAt(0, 0, 0);
    }
  }

  createLights () {
    const directional = new DirectionalLight(WHITE, 1);
    const ambient = new AmbientLight(WHITE);

    directional.position.set(0, 10, -25);
    directional.castShadow = true;

    directional.shadow.mapSize.height = 1024;
    directional.shadow.mapSize.width = 1024;

    directional.shadow.mapSize.x = 1024;
    directional.shadow.mapSize.y = 1024;

    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 50; // 100

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
    const grid = new GridHelper(100, 50, 0, 0);
    grid.material.transparent = true;
    grid.material.opacity = 0.25;
    grid.position.y = 0.0;
    this.scene.add(grid);
  }

  createRenderer () {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.element = this.renderer.domElement;
    document.body.appendChild(this.element);
  }

  createControls () {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.target.set(0, 2, 0);
    this.orbitControls.update();
  }

  createEvents () {
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize, false);
  }

  render () {
    this.renderer.render(this.scene, this.camera);

    if (this.orbitControls) {
      this.orbitControls.update();
    }
  }

  onResize () {
    this.setSize();
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  destroy () {
    window.removeEventListener('resize', this._onResize, false);
    document.body.removeChild(this.renderer.domElement);

    delete this.orbitControls;
    delete this.renderer;
    delete this.camera;
    delete this.scene;
  }

  get bounds () {
    return {
      front: 49,
      side: 49
    };
  }
}
