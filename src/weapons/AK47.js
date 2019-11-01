import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

import AK_47 from '@/assets/AK47/rifle.glb';
import SHOOT from '@/assets/AK47/shoot.mp3';

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
    // Muzzle velocity (m/s) * 1000
    this.speed = 715000;
    this._loadSounds();
  }

  _loadSounds () {
    this.shootSound = new Audio(SHOOT);
    this.shootSound.autoplay = false;
    this.shootSound.loop = false;
    this.shootSound.volume = 1;
    this.shootSound.load();
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

  // shoot (player) {
  //   const target = this.target;
  //   const collider = this.targets[target];

  //   this.shootSound.currentTime = 0.0;
  //   this.shootSound.play();

  //   if (target > -1) {
  //     const distance = collider.position.distanceTo(player);
  //     const time = Math.round(distance / this.speed);
  //     setTimeout(() => { super.shoot(target); }, time);
  //   }
  // }

  get recoil () {
    const energy = this.aiming ? 2 : 1;

    return {
      x: random(-0.01, 0.001) / energy,
      y: -0.02 / energy
    };
  }
};
