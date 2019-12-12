import { Vector3 } from '@three/math/Vector3';
import { random } from '@/utils/number';
import Events from '@/managers/Events';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2 + 0.2, Math.PI - 0.08, -0.41);
const POSITION = new Vector3(-26, 1, -5.75);
const SHOOT = '/assets/sounds/AK47.mp3';

export default class AK47 extends Weapon {
  constructor (camera, onLoad) {
    super('/assets/models/AK47.glb', camera, arm => {
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

    this.magazine = 0;
    this.ammo = 0;
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
    this.ammo = Math.min(this.ammo + 30, 150);

    Events.dispatch('reload', {
      magazine: this.magazine,
      ammo: this.ammo
    });
  }

  startReload () {
    this.arm.position.set(POSITION.x, POSITION.y, 0);
    this.arm.rotation.set(ROTATION.x, ROTATION.y, 0);
  }

  reload () {
    const toLoad = Math.min(30 - this.magazine, this.ammo);
    this.ammo = Math.max(this.ammo - toLoad, 0);
    this.magazine += toLoad;

    Events.dispatch('reload', {
      magazine: this.magazine,
      ammo: this.ammo
    });
  }

  cancelReload () {
    this._resetArmPosition();
  }

  aim (aiming, duration) {
    if (aiming) {
      this.aimTimeout = setTimeout(() => {
        this.arm.rotation.set(ROTATION.x, Math.PI, -0.1);
        this.arm.position.set(POSITION.x, 0, -1);
      }, Math.max(duration, 0));
    } else {
      this._resetArmPosition();
    }
  }

  cancelAim () {
    clearTimeout(this.aimTimeout);
    this._resetArmPosition();
  }

  shoot (player) {
    super.shoot(player);

    Events.dispatch('reload', {
      magazine: this.magazine,
      ammo: this.ammo
    });
  }

  _resetArmPosition () {
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
