type OrbitControls = import('@controls/OrbitControls').OrbitControls;
type Object3D = import('@three/core/Object3D').Object3D;
type Vector3 = import('@three/math/Vector3').Vector3;

import { AmbientLight } from '@three/lights/AmbientLight';
import { FogExp2 } from '@three/scenes/FogExp2';
import GameLevel from '@/environment/GameLevel';

import { Coords, Bounds } from '@/types';
import { min, max } from '@/utils/Array';
import Physics from '@/managers/Physics';

import { Color } from '@/utils/Color';
import Music from '@/managers/Music';
import { Config } from '@/config';

export default class Level0 extends GameLevel {
  private music = new Music(Config.Level0.music);
  private controls?: OrbitControls;

  public constructor () {
    super();

    if (Config.freeCamera) {
      import(/* webpackChunkName: "orbit-controls" */ '@controls/OrbitControls').then((Controls) => {
        this.controls = new Controls.OrbitControls(this.camera, this.canvas);

        this.camera.position.set(0, 10, -50);
        this.controls.target.set(0, 0, 25);

        this.camera.lookAt(0, 0, 0);
        this.controls.update();
      });
    }

    this.camera.far = Config.Level0.depth;
    this.createEnvironment();
    this.createLights();
  }

  private createEnvironment (): void {
    this.scene.fog = new FogExp2(Color.GREY, 0.1);
    this.scene.background = Color.getClass(Color.SKY);

    super.loadLevel(Config.Level0.model).then(level => {
      level.position.copy(Config.Level0.position as Vector3);
      level.scale.copy(Config.Level0.scale as Vector3);
    });
  }

  private createLights (): void {
    this.scene.add(new AmbientLight(Color.WHITE));
  }

  public createColliders (): void {
    const { position, height, sidewalkHeight } = Config.Level0;
    Physics.createGround(Level0.minCoords, Level0.maxCoords);

    Physics.createBounds({
      borders: Level0.bounds, y: position.y, height
    }, {
      borders: Config.Level0.sidewalk as Bounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
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

    if (Config.DEBUG) {
      this.controls?.dispose();
      delete this.controls;
    }
  }

  public static get minCoords (): Coords {
    return [
      min(Level0.bounds.map((coords: Coords) => coords[0])),
      min(Level0.bounds.map((coords: Coords) => coords[1]))
    ];
  }

  public static get maxCoords (): Coords {
    return [
      max(Level0.bounds.map((coords: Coords) => coords[0])),
      max(Level0.bounds.map((coords: Coords) => coords[1]))
    ];
  }

  public static get bounds (): Bounds {
    return Config.Level0.bounds as Bounds;
  }
}
