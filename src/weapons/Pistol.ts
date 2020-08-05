type PerspectiveCamera = import('@three/cameras/PerspectiveCamera').PerspectiveCamera;

import { Settings } from '@/settings';
import Weapon from '@/weapons/Weapon';

export default class Pistol extends Weapon {
  constructor (camera: PerspectiveCamera) {
    super(Settings.Pistol, camera);
  }
}
