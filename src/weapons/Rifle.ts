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

  /** @Override */
  public setAim (aiming: boolean, duration: number): void {
    !aiming ? this.reset() : this.aimTimeout = setTimeout(() => {
      this.model.rotation.set(Config.Rifle.rotation.x, Math.PI, -0.1);
      this.model.position.set(Config.Rifle.position.x, 0.0, -1.0);
    }, duration) as unknown as number;
  }

  /** @Override */
  public cancelReload (): void {
    // this.reloading && this.sfx.reload.stop();
    this.reloading = false;
    this.reset();
  }

  /** @Override */
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

  /** @Override */
  protected reset (): void {
    const position = Config.Rifle.position as Vector3;
    const rotation = Config.Rifle.rotation as Euler;

    this.model.position.copy(position);
    this.model.rotation.copy(rotation);

    super.reset();
  }

  public get clone (): GLTF {
    const worldScale = Config.Rifle.worldScale as Vector3;
    const rifle = this.model.clone(true);

    rifle.scale.copy(worldScale);
    rifle.rotation.set(0, 0, 0);
    rifle.visible = false;

    return rifle;
  }
}
