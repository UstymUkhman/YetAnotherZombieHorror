import { PositionalAudio } from '@three/audio/PositionalAudio';
import { AudioLoader } from '@three/loaders/AudioLoader';
import Stats from 'three/examples/js/libs/stats.min';

import { PI_2, PI_3, random } from '@/utils/number';
import { Quaternion } from '@three/math/Quaternion';

import { Vector3 } from '@three/math/Vector3';
import { Euler } from '@three/math/Euler';

import { Clock } from '@three/core/Clock';
import findIndex from 'lodash.findindex';

import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

import Gamepad from '@/managers/Gamepad';
import Events from '@/managers/Events';
import Input from '@/managers/Input';
import Music from '@/managers/Music';

import Pistol from '@/weapons/Pistol';
import AK47 from '@/weapons/AK47';
import Stage from '@/Stage';

export default class Game {
  constructor () {
    this._onHeadshoot = this.onHeadshoot.bind(this);
    this._onBodyHit = this.onBodyHit.bind(this);
    this._onLegHit = this.onLegHit.bind(this);

    Events.add('headshoot', this._onHeadshoot);
    Events.add('bodyHit', this._onBodyHit);
    Events.add('legHit', this._onLegHit);

    this._bounds = Stage.bounds;
    Enemy.setBounds(this._bounds);
    Player.setBounds(this._bounds);

    this._quat = new Quaternion();
    this._angle = new Euler();

    this.vec1 = new Vector3();
    this.vec2 = new Vector3();
    this.vec3 = new Vector3();

    this.clock = new Clock();
    this.stage = new Stage();
    this.calls = new Map();

    this.playerPosition = null;
    this.visibleRifle = false;
    this._playerSFX = false;
    this._enemySFX = false;

    this.animations = null;
    this._paused = false;
    this.enemySFX = {};

    this.player = null;
    this.enemy = null;
    this._raf = null;

    this.enemies = [];
    this.enemyID = 0;
    this.killed = 0;
  }

  loadAssets () {
    const listener = this.stage.camera.children[0];
    const audioLoader = new AudioLoader();

    this.pistol = new Pistol(this.stage.camera);

    this.ak47 = new AK47(this.stage.camera, asset => {
      this.stage.scene.add(asset);
    });

    this.player = new Player(character => {
      const sounds = this.player.settings.sounds;
      const totalSFX = Object.keys(sounds).length;
      let loadedSFX = 0;

      this.calls.set(-1, this.player.update.bind(this.player));
      this.playerPosition = this.player.character.position;
      this.player.addCamera(this.stage.camera);
      this.stage.scene.add(character);

      for (const sfx in sounds) {
        audioLoader.load(sounds[sfx], (buffer) => {
          const sound = new PositionalAudio(listener);
          this._playerSFX = ++loadedSFX === totalSFX;

          this.player.character.add(sound);
          this.player.sfx[sfx] = sound;
          sound.setBuffer(buffer);
          sound.setVolume(10);

          this.checkLoadedSFX();
        });
      }
    });

    const enemy = new Enemy(this.enemyID, this.enemy, this.animations, (character, animations) => {
      const sounds = enemy.settings.sounds;
      const totalSFX = Object.keys(sounds).length;

      this.animations = animations;
      this.enemy = character;
      let loadedSFX = 0;

      for (const sfx in sounds) {
        audioLoader.load(sounds[sfx], (buffer) => {
          const sound = new PositionalAudio(listener);
          this._enemySFX = ++loadedSFX === totalSFX;

          this.enemySFX[sfx] = sound;
          sound.setBuffer(buffer);
          sound.setVolume(25);

          this.checkLoadedSFX();
        });
      }
    });
  }

  checkLoadedSFX () {
    const loadedSFX = this._playerSFX && this._enemySFX;

    if (loadedSFX && !this.enemies.length) {
      this.player.update(this.clock.getDelta());
      Events.dispatch('loaded');
      this.stage.fadeIn();
      this.spawnEnemy();

      this.stage.createGrid();
      this.initControlLoops();
      this.createStats();
      this.loop();
    }
  }

  initControlLoops () {
    const colliders = this.getEnemyColliders();
    this.player.setWeapon(colliders, this.pistol, false);

    this.calls.set(-2, this.checkPlayerDistance.bind(this));
    this.calls.set(-3, this.stage.render.bind(this.stage));
    this.calls.set(-4, Input.update.bind(Input));

    this.player.lastDirections = Input.moves;
    Input.player = this.player;
  }

  createStats () {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.domElement);
  }

  start () {
    Input.requestPointerLock();
    this.paused = false;
  }

  checkPlayerDistance () {
    if (!this.player.alive) return;
    const length = this.enemies.length;

    for (let e = 0; e < length; e++) {
      const enemy = this.enemies[e];
      if (!enemy.alive || !this.player.alive) continue;

      const distance = enemy.getPlayerDistance();
      const attack = enemy.attacking || distance < 1.75;

      const nextToPlayer = enemy.nextToPlayer || distance < 15;
      const next = nextToPlayer && !enemy.nextToPlayer;

      if (attack) {
        const hitDelay = enemy.attack(false);

        if (hitDelay && !this.player.hitting) {
          setTimeout(() => {
            if (enemy.getPlayerDistance() > 1.75) return;
            const matrixWorld = enemy.character.matrixWorld;
            const direction = this.getHitDirection(matrixWorld);

            Gamepad.vibrate(500);

            const dead = this.player.hit(direction, hitDelay);
            if (dead) return this.stopAllEnemies(enemy.id);
          }, hitDelay);
        }
      } else if (next) {
        enemy.scream();
      }

      enemy.nextToPlayer = nextToPlayer;
      enemy.attacking = attack;
    }
  }

  getHitDirection (enemyMatrixWorld) {
    const player = this.player.character;

    player.updateMatrixWorld(true);
    this.stage.scene.updateMatrixWorld();

    player.getWorldQuaternion(this._quat);
    this._angle.setFromQuaternion(this._quat);

    this.vec2.setFromMatrixPosition(enemyMatrixWorld);
    this.vec3.setFromMatrixPosition(player.matrixWorld);
    this.vec1.subVectors(this.vec2, this.vec3).normalize();

    const pX = this.vec1.x > 0;
    const pZ = this.vec1.z > 0;

    const y = this._angle.y;
    const x0 = !this._angle.x;

    const x = this.vec1.x * PI_2;
    const xPI = this._angle.x === -Math.PI;

    const left = (pX && x0) || (!pX && xPI);
    const front = (pZ && x0) || (!pZ && xPI);
    const view = y > (x - PI_3) && y < (x + PI_3);

    return view && front ? 'Front' : left ? 'Left' : 'Right';
  }

  stopAllEnemies (/* killer */) {
    if (this.calls.has(-2)) {
      setTimeout(Input.exitPointerLock, 5000);
      const length = this.enemies.length;
      this.calls.delete(-2);

      for (let e = 0; e < length; e++) {
        const enemy = this.enemies[e];

        // if (enemy.id !== killer) {
        //   enemy.fadeOut(enemy.crawling);
        // }

        if (enemy.crawling) {
          setTimeout(() => {
            enemy.attack(true);
          }, 3000);
        } else {
          enemy.idle();
        }
      }
    }
  }

  onHeadshoot (event) {
    const index = findIndex(this.enemies, ['id', event.data]);
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (alive) {
      enemy.headshot();
      this.killEnemy(event.data);
    }
  }

  onBodyHit (event) {
    const index = findIndex(this.enemies, ['id', event.data]);
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (alive) {
      const hit = this.player.hitAmount;
      const dead = !enemy.bodyHit(hit);

      if (dead) {
        this.killEnemy(event.data);
      }
    }
  }

  onLegHit (event) {
    const index = findIndex(this.enemies, ['id', event.data]);
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (alive) {
      const hit = this.player.hitAmount / 2;
      const dead = !enemy.legHit(hit);

      if (dead) {
        this.killEnemy(event.data);
      }
    }
  }

  killEnemy (id) {
    setTimeout(() => {
      const index = findIndex(this.enemies, ['id', id]);
      this.removeEnemy(index);
      this.killed++;

      const o = this.enemies.length;
      const n = Math.min(2 ** this.killed, 64);

      for (let e = o; e < n; e++) {
        this.spawnEnemy();
      }

      this.spawnRifle();
    }, 5000);
  }

  removeEnemy (index) {
    const enemy = this.enemies[index];

    this.stage.scene.remove(enemy.character);
    this.calls.delete(enemy.id);
    enemy.dispose();

    delete this.enemies[index];
    this.enemies.splice(index, 1);
  }

  spawnEnemy () {
    const enemy = new Enemy(this.enemyID, this.enemy, this.animations);
    this.calls.set(this.enemyID, enemy.update.bind(enemy));

    enemy.playerPosition = this.playerPosition;
    if (!this.player.alive) enemy.idle();
    enemy.addSounds(this.enemySFX);
    enemy.fadeIn();

    this.enemyID++;
    this.enemies.push(enemy);
    this.stage.scene.add(enemy.character);

    if (this.player.weapon) {
      this.player.weapon.targets = this.getEnemyColliders();
      enemy.setRandomPosition();
    }
  }

  spawnRifle () {
    if ((this.killed - 5) % 10) return;

    const x = random(-this._bounds.side, this._bounds.side);
    const z = random(-this._bounds.front, this._bounds.front);

    this.calls.set(-5, this.rifleRotation.bind(this));
    this.ak47.asset.position.set(x, 1.75, z);

    this.ak47.asset.visible = true;
    this.visibleRifle = true;
  }

  rifleRotation () {
    const rifle = this.ak47.asset;
    const distance = rifle.position.distanceTo(this.playerPosition);

    rifle.rotation.y -= 0.01;

    if (this.visibleRifle && distance < 2.5) {
      const colliders = this.getEnemyColliders();
      this.visibleRifle = false;

      this.ak47.setToPlayer(true);
      this.calls.delete(-5);
      this.ak47.addAmmo();

      if (!this.player.equipRifle) {
        this.player.setWeapon(colliders, this.ak47, true);
      }
    }
  }

  getEnemyColliders () {
    const colliders = [];

    for (let e = 0; e < this.enemies.length; e++) {
      colliders.push(...this.enemies[e].colliders);
    }

    return colliders;
  }

  loop () {
    this.stats.begin();

    if (this._paused) {
      this.stage.render();
    } else {
      const calls = this.calls.values();
      const delta = this.clock.getDelta();
      for (const call of calls) call(delta);
    }

    this.stats.end();
    this._raf = requestAnimationFrame(this.loop.bind(this));
  }

  restart () {
    cancelAnimationFrame(this._raf);
    this.visibleRifle = false;
    this._raf = null;

    for (let e = 0; e < this.enemies.length; e++) {
      this.stage.scene.remove(this.enemies[e].character);
      this.calls.delete(this.enemies[e].id);
      this.enemies[e].dispose();
      delete this.enemies[e];
    }

    this._quat = new Quaternion();
    this._angle = new Euler();

    this.vec1.set(0, 0, 0);
    this.vec2.set(0, 0, 0);
    this.vec3.set(0, 0, 0);

    this.enemies = [];
    this.enemyID = 0;
    this.killed = 0;

    this.player.reset();
    this.pistol.reset();
    this.calls.clear();
    this.ak47.reset();

    Music.toggle(true);
    this.spawnEnemy();

    Gamepad.init();
    Input.init();

    this.calls.set(-1, this.player.update.bind(this.player));
    this.playerPosition = this.player.character.position;
    Events.dispatch('change', false);
    Events.dispatch('hit', 100);
    this.initControlLoops();

    this.start();
    this.loop();
  }

  end () {
    document.body.removeChild(this.stats.domElement);
    cancelAnimationFrame(this._raf);

    for (let e = 0; e < this.enemies.length; e++) {
      this.enemies[e].dispose();
      delete this.enemies[e];
    }

    Input.dispose.call(Input);
    this.player.dispose();
    this.stage.dispose();

    this.calls.clear();
    Events.dispose();
    Music.dispose();

    delete this.playerPosition;
    delete this.animations;
    delete this.enemySFX;
    delete this.enemies;
    delete this.player;
    delete this.enemy;
    delete this.stage;

    delete this._angle;
    delete this._quat;
    delete this._raf;

    delete this.vec1;
    delete this.vec2;
    delete this.vec3;
  }

  set paused (now) {
    Input.paused = now;
    this._paused = now;
  }

  get paused () {
    return this._paused;
  }
};
