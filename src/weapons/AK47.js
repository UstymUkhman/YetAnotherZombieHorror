import { Vector3 } from '@three/math/Vector3';
import AK_47 from '@/assets/gltf/ak47.glb';

import Weapon from '@/weapons/Weapon';
import anime from 'animejs';

const ROTATION = new Vector3(Math.PI / 2 + 0.2, Math.PI - 0.08, -0.41);
const POSITION = new Vector3(-26, 1, -5.75);

export default class AK47 extends Weapon {
  constructor (onLoad) {
    super(AK_47, rifle => {
      rifle.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      rifle.scale.set(0.29, 0.29, 0.29);
      rifle.position.copy(POSITION);
      onLoad(rifle);
    });
  }

  aim (aiming, duration) {
    if (aiming) {
      anime({
        targets: this.weapon.position,
        duration: duration,
        easing: 'linear',
        z: -1,
        y: 0
      });

      anime({
        targets: this.weapon.rotation,
        duration: duration,
        easing: 'linear',
        y: Math.PI,
        z: -0.1
      });
    } else {
      this.weapon.position.set(POSITION.x, POSITION.y, POSITION.z);
      this.weapon.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
    }
  }
};
