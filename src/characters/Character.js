import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { gltfLoader } from '@/utils/assetsLoader';

import { camelCase } from '@/utils/string';
import { clamp } from '@/utils/number';
import to from 'await-to-js';

const BOUNDS = {
  front: Infinity,
  side: Infinity
};

export default class Character {
  constructor (asset, settings, onLoad) {
    if (onLoad) this.load(asset, onLoad);
    this.speed = { x: 0, z: 0 };

    this.settings = settings;
    this.character = null;
    this.animations = {};

    this.running = false;
    this.moving = false;
    this.alive = true;

    this.mixer = null;
    this.health = 100;
    this.sfx = { };
  }

  load (asset, callback) {
    return new Promise(async () => {
      let [error, gltf] = await to(gltfLoader(asset));

      if (!error) {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;

            child.material = new MeshPhongMaterial({
              map: child.material.map,
              specular: 0x000000,
              transparent: true,
              skinning: true,
              shininess: 0,
              opacity: 1
            });
          }
        });

        gltf.scene.position.set(...this.settings.position);
        gltf.scene.scale.set(...this.settings.scale);

        this.createMixer(gltf.scene);
        this.createAnimations(gltf.animations);

        callback(gltf.scene, gltf.animations);
      }
    });
  }

  createMixer (character) {
    this.mixer = new AnimationMixer(character);
  }

  createAnimations (clips) {
    for (let c = 0; c < clips.length; c++) {
      const clip = camelCase(clips[c].name);
      this.animations[clip] = this.mixer.clipAction(clips[c]);
    }
  }

  cloneMaterial (character) {
    character.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;

        child.material = new MeshPhongMaterial({
          map: child.material.map,
          specular: 0x000000,
          transparent: true,
          skinning: true,
          shininess: 0,
          opacity: 0
        });
      }
    });
  }

  setDirection (direction) {
    this.speed.x = this.settings.moves[direction][0];
    this.speed.z = this.settings.moves[direction][1];
  }

  checkIfAlive () {
    if (!this.alive) return;
    this.alive = this.alive && this.health > 0;
    if (!this.alive) this.death();
  }

  update (delta) {
    this.mixer.update(delta);

    if (this.moving && this.character) {
      this.character.translateX(this.speed.x);
      this.character.translateZ(this.speed.z);

      this.character.position.z = clamp(
        this.character.position.z,
        -BOUNDS.front,
        BOUNDS.front
      );

      this.character.position.x = clamp(
        this.character.position.x,
        -BOUNDS.side,
        BOUNDS.side
      );
    }
  }

  reset () {
    this.speed = { x: 0, z: 0 };
    this.running = false;
    this.moving = false;
    this.alive = true;
    this.health = 100;
  }

  dispose () {
    const children = this.character.children;

    this.rightUpLeg.remove(this.colliders[2]);
    this.leftUpLeg.remove(this.colliders[3]);
    this.rightLeg.remove(this.colliders[4]);
    this.leftLeg.remove(this.colliders[5]);
    this.spine.remove(this.colliders[1]);
    this.head.remove(this.colliders[0]);

    for (let c = 0; c < this.colliders.length; c++) {
      this.colliders.splice(c, 1);
    }

    for (let c = 0; c < children.length; c++) {
      this.character.remove(children[c]);
    }

    for (const animation in this.animations) {
      this.animations[animation].stopFading();
      this.animations[animation].stop();
      delete this.animations[animation];
    }

    delete this.animations;
    delete this.colliders;
    delete this.character;
    delete this.settings;
    delete this.speed;
    delete this.sfx;
  }

  static setBounds (stage) {
    BOUNDS.front = stage.front;
    BOUNDS.side = stage.side;
  }

  get bounds () {
    return BOUNDS;
  }
};
