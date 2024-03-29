import type { WeaponConfig, WeaponSound, SoundOptions } from '@/weapons/types';
import type { Texture } from 'three/src/textures/Texture';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';

import Weapon from '@/weapons/Weapon';
import Configs from '@/configs';
import anime from 'animejs';

export default class Pistol extends Weapon
{
  private readonly position = Configs.Pistol.position as Vector3;
  private readonly rotation = Configs.Pistol.rotation as Euler;

  private readonly damage = Configs.Gameplay.damage.pistol;

  public constructor (envMap: Texture) {
    super(Configs.Pistol as WeaponConfig);
    this.load(envMap);
  }

  protected override playSound (sfx: WeaponSound, options: SoundOptions): void {
    super.playSound(sfx, { ...options, pistol: true });
  }

  protected override stopSound (sfx: WeaponSound): void {
    super.stopSound(sfx, true);
  }

  public override setAim (): void {
    anime({
      targets: this.object.rotation,
      y: this.rotation.y + 0.015,
      x: this.rotation.x,
      easing: 'linear',
      duration: 200,
      delay: 200,
      z: -0.06
    });

    anime({
      targets: this.object.position,
      x: this.position.x,
      z: this.position.z,
      easing: 'linear',
      duration: 200,
      delay: 200,
      y: -4.45
    });
  }

  public override cancelAim (duration: number): void {
    anime({
      targets: this.object.rotation,
      x: this.rotation.x,
      y: this.rotation.y,
      z: this.rotation.z,
      easing: 'linear',
      duration
    });

    anime({
      targets: this.object.position,
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      easing: 'linear',
      duration
    });
  }

  public override toggleVisibility (hide: number, show: number, duration = 100.0): void {
    this.object.children[0].children.forEach(child => {
      const { material } = child as Mesh;

      anime({
        targets: material,
        easing: 'linear',
        opacity: 0.0,
        delay: hide,
        duration
      });

      setTimeout(() => anime({
        targets: material,
        easing: 'linear',
        opacity: 1.0,
        duration
      }), show);
    });
  }

  public override getDamage (index: number): number {
    const { head, body, leg } = this.damage;
    return !index ? head : index === 1 ? body : leg;
  }

  public override dispose (): void {
    super.dispose();
  }
}
