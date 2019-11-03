import PISTOL from '@/assets/1911/pistol.glb';
import SHOOT from '@/assets/1911/shoot.mp3';

import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2, Math.PI + 0.2, -0.075);
const POSITION = new Vector3(-10, -4, 0.25);

export default class Pistol extends Weapon {
  constructor (camera) {
    super(PISTOL, camera, pistol => {
      pistol.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      pistol.position.copy(POSITION);
      pistol.scale.set(13, 13, 13);
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

  cancelAim () { }

  get recoil () {
    const energy = this.aiming ? 2 : 1;

    return {
      x: random(-0.01, 0.01) / energy,
      y: -0.02 / energy
    };
  }
};
