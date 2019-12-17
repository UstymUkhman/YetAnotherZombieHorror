import { Vector3 } from '@three/math/Vector3';
import PISTOL from '@/assets/models/1911.glb';
import SHOOT from '@/assets/sfx/1911.mp3';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2, Math.PI + 0.2, -0.075);
const POSITION = new Vector3(-10, -4, 0.25);

export default class Pistol extends Weapon {
  constructor (camera) {
    const settings = {
      model: PISTOL,
      shoot: SHOOT
    };

    super(settings, camera, arm => {
      arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      arm.position.copy(POSITION);
      arm.scale.set(13, 13, 13);
    });

    this.verticalRecoil = -0.02;
    this.speed = 255000;

    this.spread = {
      x: 0.01,
      y: 0.01
    };
  }

  cancelAim () { }

  get hit () {
    return 10;
  }
};
