import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2, Math.PI + 0.2, -0.075);
const POSITION = new Vector3(-10, -4, 0.25);

export default class Pistol extends Weapon {
  constructor (camera) {
    const settings = {
      model: '/assets/models/1911.glb',
      shoot: '/assets/sounds/1911.mp3'
    };

    super(settings, camera, arm => {
      arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      arm.position.copy(POSITION);
      arm.scale.set(13, 13, 13);
    });

    this.speed = 255000;
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
