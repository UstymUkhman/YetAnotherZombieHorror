type Vector3 = import('three/src/math/Vector3').Vector3;
type Euler = import('three/src/math/Euler').Euler;

import Weapon from '@/weapons/Weapon';
import { Config } from '@/config';
import anime from 'animejs';

export default class Pistol extends Weapon
{
  private readonly position = Config.Pistol.position as Vector3;
  private readonly rotation = Config.Pistol.rotation as Euler;

  public constructor () {
    super(Config.Pistol);
  }

  /** @Override */
  public setAim (): void {
    anime({
      targets: this.model.rotation,
      y: this.rotation.y + 0.015,
      x: this.rotation.x,
      easing: 'linear',
      duration: 400,
      z: -0.06
    });

    anime({
      targets: this.model.position,
      x: this.position.x,
      z: this.position.z,
      easing: 'linear',
      duration: 400,
      y: -4.45
    });
  }

  /** @Override */
  public cancelAim (duration: number): void {
    anime({
      targets: this.model.rotation,
      x: this.rotation.x,
      y: this.rotation.y,
      z: this.rotation.z,
      easing: 'linear',
      duration
    });

    anime({
      targets: this.model.position,
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      easing: 'linear',
      duration
    });
  }
}
