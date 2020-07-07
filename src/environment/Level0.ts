// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

type PerspectiveCamera = import('@three/cameras/PerspectiveCamera').PerspectiveCamera;
type OrbitControls = import('@controls/OrbitControls').OrbitControls;
type Stats = typeof import('three/examples/js/libs/stats.min');

import { AmbientLight } from '@three/lights/AmbientLight';
import GameLevel from '@/environment/GameLevel';
import { Vector3 } from '@three/math/Vector3';

import { Fog } from '@three/scenes/Fog';
import { Color } from '@/utils/Color';
import { Settings } from '@/settings';

export default class Level0 extends GameLevel {
  private controls?: OrbitControls;
  private stats?: Stats = null;
  private raf: number;

  public constructor () {
    super();

    if (Settings.DEBUG) {
      import(/* webpackChunkName: "stats.min" */ 'three/examples/js/libs/stats.min').then((Stats) => {
        this.stats = new Stats.default();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.domElement);
      });

      import(/* webpackChunkName: "orbit-controls" */ '@controls/OrbitControls').then((Controls) => {
        this.controls = new Controls.OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 0, 25);
        this.controls.update();
      });
    }

    this.setCamera(new Vector3(0, 10, -50));
    this.createEnvironment();
    this.createLights();

    this.raf = requestAnimationFrame(this.render.bind(this));
  }

  private setCamera (position: Vector3): void {
    this.camera.position.copy(position);

    if (Settings.DEBUG) {
      this.camera.lookAt(0, 0, 0);
    }
  }

  public getCamera (): PerspectiveCamera {
    return this.camera;
  }

  private createEnvironment (): void {
    super.loadLevel(Settings.Level0.model).then(level => {
      level.position.copy(Settings.Level0.position as Vector3);
      level.scale.copy(Settings.Level0.scale as Vector3);
    });

    if (!Settings.DEBUG) {
      this.scene.fog = new Fog(Color.GREY, 0.1, 100);
    }
  }

  private createLights (): void {
    this.scene.add(new AmbientLight(Color.WHITE));
  }

  public render (): void {
    this.stats?.begin();

    super.render();
    this.controls?.update();
    this.raf = requestAnimationFrame(this.render.bind(this));

    this.stats?.end();
  }

  public destroy (): void {
    cancelAnimationFrame(this.raf);
    super.destroy();

    if (Settings.DEBUG) {
      document.body.removeChild(this.stats.domElement);
      this.controls?.dispose();

      delete this.controls;
      delete this.stats;
    }
  }
}
