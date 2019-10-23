import { Vector3 } from '@three/math/Vector3';
import AK_47 from '@/assets/gltf/ak47.glb';
import Weapon from '@/weapons/Weapon';

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

    this.aimTimeout = null;
  }

  aim (aiming, duration) {
    if (aiming) {
      this.aimTimeout = setTimeout(() => {
        this.arm.rotation.set(ROTATION.x, Math.PI, -0.1);
        this.arm.position.set(POSITION.x, 0, -1);
      }, Math.max(duration, 0));
    } else {
      this.arm.position.set(POSITION.x, POSITION.y, POSITION.z);
      this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
    }
  }

  cancelAim () {
    clearTimeout(this.aimTimeout);
    this.arm.position.set(POSITION.x, POSITION.y, POSITION.z);
    this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
  }
};
