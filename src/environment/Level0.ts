// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

type OrbitControls = import('@controls/OrbitControls').OrbitControls;
type Object3D = import('@three/core/Object3D').Object3D;
type Vector3 = import('@three/math/Vector3').Vector3;
type Coords = Readonly<Array<number>>;

import { AmbientLight } from '@three/lights/AmbientLight';
import GameLevel from '@/environment/GameLevel';
import { min, max } from '@/utils/Array';
import Physics from '@/managers/Physics';
import { Fog } from '@three/scenes/Fog';

import { Color } from '@/utils/Color';
import { Settings } from '@/settings';
import Music from '@/managers/Music';

export default class Level0 extends GameLevel {
  private music = new Music(Settings.Level0.music);
  private controls?: OrbitControls;

  public constructor () {
    super();

    if (Settings.freeCamera) {
      import(/* webpackChunkName: "orbit-controls" */ '@controls/OrbitControls').then((Controls) => {
        this.controls = new Controls.OrbitControls(this.camera, this.canvas);

        this.camera.position.set(0, 10, -50);
        this.controls.target.set(0, 0, 25);

        this.camera.lookAt(0, 0, 0);
        this.controls.update();
      });
    }

    this.camera.far = Settings.Level0.depth;
    this.createEnvironment();
    this.createLights();
  }

  private createEnvironment (): void {
    super.createSkybox(Settings.Level0.skybox);

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

  public createColliders (): void {
    const { height, position } = Settings.Level0;
    Physics.createGround(Level0.minCoords, Level0.maxCoords);

    Physics.createBounds({
      borders: Level0.bounds, y: position.y, height
    }, {
      borders: Settings.Level0.sidewalk, height: 0.216, y: -0.322
    });
  }

  public addObject (model: Object3D): void {
    this.scene.add(model);
  }

  public render (): void {
    this.controls?.update();
    super.render();
  }

  public destroy (): void {
    this.music.destroy();
    super.destroy();

    if (Settings.DEBUG) {
      this.controls?.dispose();
      delete this.controls;
    }
  }

  public static get minCoords (): Array<number> {
    return [
      min(Level0.bounds.map((coords: Coords) => coords[0])),
      min(Level0.bounds.map((coords: Coords) => coords[1]))
    ];
  }

  public static get maxCoords (): Array<number> {
    return [
      max(Level0.bounds.map((coords: Coords) => coords[0])),
      max(Level0.bounds.map((coords: Coords) => coords[1]))
    ];
  }

  public static get bounds (): Settings.Bounds {
    return Settings.Level0.bounds;
  }
}
