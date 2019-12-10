import AK_47 from '@/assets/weapons/AK47.glb';
import SHOOT from '@/assets/weapons/AK47.mp3';

import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2 + 0.2, Math.PI - 0.08, -0.41);
const POSITION = new Vector3(-26, 1, -5.75);

export default class AK47 extends Weapon {
  constructor (camera, onLoad) {
    super(AK_47, camera, arm => {
      this.asset = arm.clone(true);
      this.arm = arm;

      this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      this.arm.scale.set(0.29, 0.29, 0.29);
      this.arm.position.copy(POSITION);
      this.arm.visible = false;

      this.asset.scale.set(0.005, 0.005, 0.005);
      this.asset.rotation.set(0, 0, 0);
      this.asset.visible = false;
      onLoad(this.asset);
    });

    this.aimTimeout = null;
    this.speed = 715000;
    this._loadSounds();

    this.magazine = 30;
    this.ammo = 30;
  }

  _loadSounds () {
    this.shootSound = new Audio(SHOOT);
    this.shootSound.autoplay = false;
    this.shootSound.loop = false;
    this.shootSound.volume = 1;
    this.shootSound.load();
  }

  spawnOnStage () {
    this.asset.visible = true;
  }

  setToPlayer (remove) {
    if (remove) this.asset.visible = false;
    this.arm.visible = true;
  }

  addAmmo () {
    this.ammo += 30;
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
