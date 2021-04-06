import Weapon from '@/weapons/Weapon';
import { Config } from '@/config';

export default class Pistol extends Weapon
{
  public constructor () {
    super(Config.Pistol);
  }
}
