import PISTOL from '@/assets/1911/pistol.glb';
import SHOOT from '@/assets/1911/shoot.mp3';

import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2, Math.PI + 0.2, -0.075);
const POSITION = new Vector3(-10, -4, 0.25);

export default class Pistol extends Weapon {
  constructor (onLoad) {
    super(PISTOL, pistol => {
      pistol.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      pistol.position.copy(POSITION);
      pistol.scale.set(13, 13, 13);
      onLoad(pistol);
    });

    // Muzzle velocity (m/s) * 1000
    this.speed = 255000;
    this._loadSounds();
  }

  _loadSounds () {
    this.shootSound = new Audio(SHOOT);
    this.shootSound.autoplay = false;
    this.shootSound.loop = false;
    this.shootSound.volume = 1;
    this.shootSound.load();
  }

  // aim (aiming, duration) {
  //   if (aiming) {
  //     this.aimTimeout = setTimeout(() => {
  //       this.arm.rotation.set(ROTATION.x, Math.PI, -0.1);
  //       this.arm.position.set(POSITION.x, 0, -1);
  //     }, Math.max(duration, 0));
  //   } else {
  //     this.arm.position.set(POSITION.x, POSITION.y, POSITION.z);
  //     this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
  //   }
  // }

  // cancelAim () {
  //   clearTimeout(this.aimTimeout);
  //   this.arm.position.set(POSITION.x, POSITION.y, POSITION.z);
  //   this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
  // }

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
    return {
      x: random(-0.005, 0.005),
      y: -0.01
    };
  }
};
