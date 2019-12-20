import { Vector3 } from '@three/math/Vector3';
import Settings from '@/weapons/Pistol.json';
import Weapon from '@/weapons/Weapon';

const POSITION = new Vector3(-10, -4, 0.25);
const ROTATION = new Vector3(
  Math.PI / 2,
  Math.PI + 0.2,
  -0.075
);

export default class Pistol extends Weapon {
  constructor (camera) {
    super(Settings, camera, arm => {
      arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      arm.position.copy(POSITION);
      arm.scale.set(13, 13, 13);
    });

    this.init();
  }

  init () {
    this.verticalRecoil = -0.02;
    this.speed = 255000;

    this.spread = {
      x: 0.01,
      y: 0.01
    };
  }

  cancelAim () { }

  reset () {
    this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
    this.arm.position.copy(POSITION);
    this.arm.scale.set(13, 13, 13);

    super.reset();
    this.init();
  }

  get hit () {
    return 10;
  }
};
