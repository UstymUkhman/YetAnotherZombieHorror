type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;
type Vector3 = import('@three/math/Vector3').Vector3;
type Euler = import('@three/math/Euler').Euler;

// import { GameEvents } from '@/managers/GameEvents';
import Weapon from '@/weapons/Weapon';
import { Config } from '@/config';

export default class Rifle extends Weapon {
  private aimTimeout?: number;
  private reloading = false;

  public constructor () {
    super(Config.Rifle);
  }

  private reset (): void {
    const position = Config.Rifle.position as Vector3;
    const rotation = Config.Rifle.rotation as Euler;

    this.model.position.copy(position);
    this.model.rotation.copy(rotation);
  }

  public cancelReload (): void {
    // this.reloading && this.sfx.reload.stop();
    this.reloading = false;
    this.reset();
  }

  public cancelAim (): void {
    clearTimeout(this.aimTimeout);
    this.reset();
  }

  /* public shoot (position: Vector3): void {
    super.shoot(position);

    GameEvents.dispatch('reload', {
      magazine: this.magazine,
      ammo: this.ammo
    });
  } */

  public get clone (): GLTF {
    const worldScale = Config.Rifle.worldScale as Vector3;
    const rifle = this.model.clone(true);

    rifle.scale.copy(worldScale);
    rifle.rotation.set(0, 0, 0);
    rifle.visible = false;

    return rifle;
  }
}
