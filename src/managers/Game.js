import Stats from 'three/examples/js/libs/stats.min';
import { Clock } from '@three/core/Clock';
import findIndex from 'lodash.findindex';
import { random } from '@/utils/number';

import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

import Events from '@/managers/Events';
import Input from '@/managers/Input';

import Pistol from '@/weapons/Pistol';
import AK47 from '@/weapons/AK47';
import Stage from '@/Stage';

export default class Game {
  constructor (/* fps = 60 */) {
    this._onHeadshoot = this.onHeadshoot.bind(this);
    this._onBodyHit = this.onBodyHit.bind(this);
    this._onLoaded = this.onLoaded.bind(this);
    this._onLegHit = this.onLegHit.bind(this);

    Events.add('headshoot', this._onHeadshoot);
    Events.add('bodyHit', this._onBodyHit);
    Events.add('legHit', this._onLegHit);
    Events.add('loaded', this._onLoaded);

    this._bounds = Stage.bounds;
    Enemy.setBounds(this._bounds);
    Player.setBounds(this._bounds);

    this.clock = new Clock();
    this.stage = new Stage();
    this.calls = new Map();

    this.visibleRifle = false;
    this.animations = null;
    this.player = null;
    this.enemy = null;

    // this.frame = Date.now();
    // this.fps = 1000 / fps;
    this.enemies = [];
    this.enemyID = 0;
    this.killed = 0;

    this.createStats();
    this.loadAssets();
    this.loop();
  }

  createStats () {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.domElement);
  }

  loadAssets () {
    this.pistol = new Pistol(this.stage.camera);
    this.ak47 = new AK47(this.stage.camera);

    this.player = new Player(character => {
      this.calls.set(-1, this.player.update.bind(this.player));
      this.player.addCamera(this.stage.camera);
      this.stage.scene.add(character);
    });

    const enemy = new Enemy(this.enemyID, this.enemy, this.animations, (character, animations) => {
      this.calls.set(this.enemyID, enemy.update.bind(enemy));
      this.stage.scene.add(character);

      this.animations = animations;
      this.enemy = character;
      this.enemyID++;
    });

    this.enemies.push(enemy);
  }

  onLoaded () {
    Events.remove('loaded');
    const colliders = this.getEnemyColliders();

    setTimeout(() => {
      this.player.setWeapon(colliders, this.pistol, false);
      this.calls.set(-4, Input.update.bind(Input));
      Input.player = this.player;

      this.setCharacters();
      this.stage.createGrid();
      this.calls.set(-3, this.stage.render.bind(this.stage));
    }, 100);
  }

  setCharacters () {
    this.playerPosition = this.player.character.position;
    this.enemies[0].playerPosition = this.playerPosition;

    this.calls.set(-2, this.checkPlayerDistance.bind(this));

    setTimeout(() => {
      const grid = this.stage.scene.children.length - 1;
      this.stage.scene.remove(this.stage.scene.children[grid]);
      this.enemies[0].fadeIn();
      this.stage.createGrid();
    }, 100);
  }

  checkPlayerDistance () {
    const length = this.enemies.length;

    for (let e = 0; e < length; e++) {
      const enemy = this.enemies[e];
      const enemyPosition = enemy.character.position;
      const distance = enemyPosition.distanceTo(this.playerPosition);

      const attack = enemy.attacking || distance < 1.75;
      const nextToPlayer = enemy.nextToPlayer || distance < 15;

      if (enemy.alive) {
        const next = nextToPlayer && !enemy.nextToPlayer;

        if (attack) {
          /* const hitDelay = */ enemy.attack();
          // console.log(hitDelay);
        } else if (next) {
          enemy.scream();
        }
      }

      enemy.nextToPlayer = nextToPlayer;
      enemy.attacking = attack;
    }
  }

  spawnRifle () {
    const z = random(-this._bounds.front, this._bounds.front);
    const x = random(-this._bounds.side, this._bounds.side);

    this.calls.set(-5, this.rifleRotation.bind(this));
    this.ak47.arm.position.set(x, 1.75, z);
    this.stage.scene.add(this.ak47.arm);
    this.visibleRifle = true;
  }

  rifleRotation () {
    const rifle = this.ak47.arm;
    const distance = rifle.position.distanceTo(this.playerPosition);

    rifle.rotation.y -= 0.01;

    if (distance < 2.5) {
      const colliders = this.getEnemyColliders();
      this.visibleRifle = false;
      this.calls.delete(-4);

      this.ak47.setToPlayer();
      this.player.setWeapon(colliders, this.ak47, true);
    }
  }

  onHeadshoot (event) {
    const index = findIndex(this.enemies, ['id', event.data]);
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (alive) {
      enemy.headshot();
      this.removeEnemy(event.data);
    }
  }

  onBodyHit (event) {
    const index = findIndex(this.enemies, ['id', event.data]);
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (alive) {
      const hit = this.player.hit;
      const dead = !enemy.bodyHit(hit);

      if (dead) {
        this.removeEnemy(event.data);
      }
    }
  }

  onLegHit (event) {
    const index = findIndex(this.enemies, ['id', event.data]);
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (alive) {
      const hit = this.player.hit / 2;
      const dead = !enemy.legHit(hit);

      if (dead) {
        this.removeEnemy(event.data);
      }
    }
  }

  removeEnemy (id) {
    setTimeout(() => {
      const index = findIndex(this.enemies, ['id', id]);
      const enemy = this.enemies[index];

      this.stage.scene.remove(enemy.character);
      this.calls.delete(enemy.id);
      enemy.dispose();
      this.killed++;

      delete this.enemies[index];
      this.enemies.splice(index, 1);

      this.spawnEnemy();
      this.spawnEnemy();
    }, 5000);
  }

  spawnEnemy () {
    const enemy = new Enemy(this.enemyID, this.enemy, this.animations);
    this.calls.set(this.enemyID, enemy.update.bind(enemy));
    enemy.playerPosition = this.playerPosition;
    enemy.setRandomPosition();
    enemy.fadeIn();

    this.enemyID++;
    this.enemies.push(enemy);
    this.stage.scene.add(enemy.character);
    this.player.weapon.targets = this.getEnemyColliders();
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
    // const now = Date.now();
    // const elapse = now - this.frame;

    // requestAnimationFrame(this.loop.bind(this));
    // if (elapse < this.fps) return;

    const delta = this.clock.getDelta();
    const calls = this.calls.values();

    for (const call of calls) call(delta);
    requestAnimationFrame(this.loop.bind(this));
    // this.frame = now - (elapse % this.fps);
    this.stats.end();
  }

  end () {
    document.body.removeChild(this.stats.domElement);
    // Input.destroy.call(Input);
    this.player.dispose();
    this.stage.destroy();
    this.calls.clear();

    for (let e = 0; e < this.enemies.length; e++) {
      this.enemies[e].dispose();
      delete this.enemies[e];
    }

    delete this.player;
    delete this.stage;
    delete this.stats;
  }
};
