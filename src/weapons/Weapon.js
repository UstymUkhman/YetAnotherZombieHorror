import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { PositionalAudio } from '@three/audio/PositionalAudio';
import { AudioLoader } from '@three/loaders/AudioLoader';

import { gltfLoader } from '@/utils/assetsLoader';
import { Raycaster } from '@three/core/Raycaster';
import { Vector2 } from '@three/math/Vector2';

import { FrontSide } from '@three/constants';
import { random } from '@/utils/number';
import Events from '@/managers/Events';
import to from 'await-to-js';

const AIM_NEAR = 3;
const NEAR = 4.5;

export default class Weapon {
  constructor (weapon, camera, onLoad = null) {
    this._raycaster = new Raycaster();
    this._origin = new Vector2(0, 0);
    this._audio = new AudioLoader();
    this._raycaster.near = NEAR;
    this.load(weapon, onLoad);

    this.spread = { x: 0, y: 0 };
    this.magazine = Infinity;
    this.verticalRecoil = 0;
    this._camera = camera;
    this._aiming = false;

    this.ammo = Infinity;
    this.targets = [];
    this.damage = 10;

    this.sfx = {
      reload: null,
      shoot: null,
      empty: null
    };
  }

  load (weapon, callback) {
    return new Promise(async () => {
      let [error, gltf] = await to(gltfLoader(weapon.model));

      if (!error) {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;

            child.material = new MeshPhongMaterial({
              map: child.material.map,
              specular: 0x2F2F2F,
              side: FrontSide
            });
          }
        });

        this.arm = gltf.scene;
        this.loadSounds(weapon);
        callback(gltf.scene);
      }
    });
  }

  loadSounds (sounds) {
    const listener = this._camera.children[0];
    const sfx = Object.keys(this.sfx);

    for (const sound of sfx) {
      if (sounds.hasOwnProperty(sound)) {
        const volume = sound === 'shoot' ? 10 : 5;

        this._audio.load(sounds[sound], (buffer) => {
          this.sfx[sound] = new PositionalAudio(listener);
					this.sfx[sound].setBuffer(buffer);
          this.sfx[sound].setVolume(volume);
					this.arm.add(this.sfx[sound]);
        });
      }
    }
  }

  cancelReload () { }

  setToPlayer () { }

  shoot (player) {
    const target = this.target;
    const empty = this.magazine === 0;
    const collider = this.targets[target];
    this.magazine = Math.max(this.magazine - 1, 0);

    if (empty) {
      if (this.sfx.empty.isPlaying) this.sfx.empty.stop();
      this.sfx.empty.play();
    } else {
      if (this.sfx.shoot.isPlaying) this.sfx.shoot.stop();
      this.sfx.shoot.play();
    }

    if (!empty && target > -1) {
      const distance = collider.position.distanceTo(player);
      const time = Math.round(distance / this.speed);
      const event = this.getEvent(target);

      setTimeout(() => {
        Events.dispatch(event, collider.userData.enemy);
      }, time);
    }
  }

  getEvent (index) {
    const collider = index % 6;
    return !collider ? 'headshoot' :
      collider === 1 ? 'bodyHit' : 'legHit';
  }

  reset () {
    this.spread = { x: 0, y: 0 };
    this.magazine = Infinity;
    this.verticalRecoil = 0;
    this._aiming = false;

    this.ammo = Infinity;
    this.targets = [];
    this.damage = 10;
  }

  get target () {
    // this._origin.x += random(-this.spread.x, this.spread.x);
    // this._origin.y += random(-this.spread.y, this.spread.y);

    this._raycaster.setFromCamera(this._origin, this._camera);
    const colliders = this._raycaster.intersectObjects(this.targets);
    return colliders.length ? this.targets.indexOf(colliders[0].object) : -1;
  }

  get recoil () {
    const energy = this.aiming ? 2 : 1;

    return {
      x: random(-this.spread.x, this.spread.x) / energy,
      y: this.verticalRecoil / energy
    };
  }

  set aiming (now) {
    this._raycaster.near = now ? AIM_NEAR : NEAR;
    this._aiming = now;
  }

  get aiming () {
    this._aiming;
  }
};
