import { Settings } from '@/settings';
import Weapon from '@/weapons/Weapon';

export default class Pistol extends Weapon {
  constructor () {
    super(Settings.Pistol);
  }
}
