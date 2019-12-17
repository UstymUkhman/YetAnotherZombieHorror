import { Vector3 } from '@three/math/Vector3';
import AK_47 from '@/assets/models/AK47.glb';

import RELOAD from '@/assets/sfx/reload.mp3';
import EMPTY from '@/assets/sfx/empty.mp3';
import SHOOT from '@/assets/sfx/AK47.mp3';

import Events from '@/managers/Events';
import Weapon from '@/weapons/Weapon';

const ROTATION = new Vector3(Math.PI / 2 + 0.2, Math.PI - 0.08, -0.41);
const POSITION = new Vector3(-26, 1, -5.75);

export default class AK47 extends Weapon {
  constructor (camera, onLoad) {
    const settings = {
      reload: RELOAD,
      empty: EMPTY,
      shoot: SHOOT,
      model: AK_47
    };

    super(settings, camera, arm => {
      this.asset = arm.clone(true);

      this.arm.rotation.set(ROTATION.x, ROTATION.y, ROTATION.z);
      this.arm.scale.set(0.29, 0.29, 0.29);
      this.arm.position.copy(POSITION);
      this.arm.visible = false;

      this.asset.scale.set(0.005, 0.005, 0.005);
      this.asset.rotation.set(0, 0, 0);
      this.asset.visible = false;
      onLoad(this.asset);
    });

    this.verticalRecoil = -0.03;
    this._reloading = false;
    this.aimTimeout = null;
    this.speed = 715000;
    this.magazine = 0;
    this.ammo = 0;

    this.spread = {
      x: 0.025,
      y: 0.025
    };
  }

  spawnOnStage () {
    this.asset.visible = true;
  }

  setToPlayer (remove) {
    if (remove) this.asset.visible = false;
    this.arm.visible = true;
  }

  addAmmo (reload = false) {
    if (reload) {
      const toLoad = Math.min(30 - this.magazine, this.ammo);
      setTimeout(() => { this._reloading = false; }, 1000);

      this.ammo = Math.max(this.ammo - toLoad, 0);
      this.magazine += toLoad;
    } else {
      this.ammo = Math.min(this.ammo + 30, 150);
    }

    Events.dispatch('reload', {
      magazine: this.magazine,
      ammo: this.ammo
    });
  }

  startReload () {
    this.arm.position.set(POSITION.x, POSITION.y, 0);
    this.arm.rotation.set(ROTATION.x, ROTATION.y, 0);

    this._reloading = true;
    this.sfx.reload.play();
  }

  cancelReload () {
    if (this._reloading) this.sfx.reload.stop();
    this._resetArmPosition();
    this._reloading = false;
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

  get hit () {
    return 20;
  }
};
