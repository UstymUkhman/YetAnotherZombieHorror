import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

import AK_47 from '@/assets/AK47/rifle.glb';
import SHOOT from '@/assets/AK47/shoot.mp3';

const ROTATION = new Vector3(Math.PI / 2 + 0.2, Math.PI - 0.08, -0.41);
const POSITION = new Vector3(-26, 1, -5.75);

export default class AK47 extends Weapon {
  constructor (camera) {
    super(AK_47, camera, () => {
      this.setOnStage();
    });

    this.aimTimeout = null;
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

  setOnStage () {
    this.arm.scale.set(0.005, 0.005, 0.005);
    this.arm.rotation.set(0, 0, 0);
  }

  setToPlayer () {
    this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
    this.arm.scale.set(0.29, 0.29, 0.29);
    this.arm.position.copy(POSITION);
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

  get recoil () {
    const energy = this.aiming ? 2 : 1;

    return {
      x: random(-0.02, 0.02) / energy,
      y: -0.03 / energy
    };
  }

  get hit () {
    return 20;
  }
};
