import PISTOL from '@/assets/weapons/1911.glb';
import SHOOT from '@/assets/weapons/1911.mp3';

import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2, Math.PI + 0.2, -0.075);
const POSITION = new Vector3(-10, -4, 0.25);

export default class Pistol extends Weapon {
  constructor (camera) {
    super(PISTOL, camera, () => {
      this.setToPlayer();
    });

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

  /* spawnMagazine (bounds, callback) {
    const z = random(-bounds.front, bounds.front);
    const x = random(-bounds.side, bounds.side);

    this.magazine.position.set(x, 2.5, z);
    callback(this.magazine);
  } */

  setOnStage () {
    this.arm.scale.set(0.225, 0.225, 0.225);
    this.arm.rotation.set(0, 0, 0);
  }

  setToPlayer () {
    this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
    this.arm.position.copy(POSITION);
    this.arm.scale.set(13, 13, 13);
  }

  cancelAim () { }

  get recoil () {
    const energy = this.aiming ? 2 : 1;

    return {
      x: random(-0.01, 0.01) / energy,
      y: -0.02 / energy
    };
  }

  get hit () {
    return 10;
  }
};
