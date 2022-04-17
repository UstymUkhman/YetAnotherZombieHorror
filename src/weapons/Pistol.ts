import type { Texture } from 'three/src/textures/Texture';
import type { Vector3 } from 'three/src/math/Vector3';

import type { WeaponConfig } from '@/weapons/types';
import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';

import Weapon from '@/weapons/Weapon';
import Configs from '@/configs';
import anime from 'animejs';

export default class Pistol extends Weapon
{
  private readonly position = Configs.Pistol.position as Vector3;
  private readonly rotation = Configs.Pistol.rotation as Euler;

  public constructor (envMap: Texture) {
    super(Configs.Pistol as WeaponConfig);
    this.load(envMap);
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

  public override toggleVisibility (hideDelay: number, showDelay: number): void {
    this.object.children[0].children.forEach(child => {
      const childMesh = child as Mesh;

      anime({
        targets: childMesh.material,
        delay: hideDelay,
        easing: 'linear',
        duration: 100,
        opacity: 0.0
      });

      setTimeout(() => anime({
        targets: childMesh.material,
        easing: 'linear',
        duration: 100,
        opacity: 1.0
      }), showDelay);
    });
  }

  public override dispose (): void {
    super.dispose();
  }
}
