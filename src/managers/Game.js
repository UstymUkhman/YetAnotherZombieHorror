import Stats from 'three/examples/js/libs/stats.min';
import { Clock } from '@three/core/Clock';
import { random } from '@/utils/number';

import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

import Events from '@/managers/Events';
import Input from '@/managers/Input';

import findIndex from 'lodash.findindex';
import Pistol from '@/weapons/Pistol';
import AK47 from '@/weapons/AK47';
import Stage from '@/Stage';

export default class Game {
  constructor () {
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

    this._clock = new Clock();
    this.stage = new Stage();

    this.animations = null;
    this.player = null;
    this.enemy = null;

    this.enemies = [];
    this.calls = [];

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
      this.add(this.player.update.bind(this.player));
      this.player.addCamera(this.stage.camera);
      this.stage.scene.add(character);
    });

    const enemy = new Enemy(this.enemyID++, this.enemy, this.animations, (character, animations) => {
      this.add(enemy.update.bind(enemy));
      this.stage.scene.add(character);

      this.animations = animations;
      this.enemy = character;
    });

    this.enemies.push(enemy);
  }

  onLoaded () {
    Events.remove('loaded');
    const colliders = this.getEnemyColliders();

    setTimeout(() => {
      this.player.setWeapon(colliders, this.pistol, false);
      this.add(Input.update.bind(Input));
      Input.player = this.player;

      this.setCharacters();
      this.stage.createGrid();
      this.add(this.stage.render.bind(this.stage));
    }, 100);
  }

  setCharacters () {
    this.playerPosition = this.player.character.position;
    this.enemies[0].playerPosition = this.playerPosition;
    this.enemies[0].character.lookAt(this.playerPosition);

    this._checkPlayerDistance = this.checkPlayerDistance.bind(this);
    this._distanceLoop = this.add(this._checkPlayerDistance);

    setTimeout(() => {
      const grid = this.stage.scene.children.length - 1;
      this.stage.scene.remove(this.stage.scene.children[grid]);
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
      const nextToPlayer = enemy.nextToPlayer || distance < 10;
      const visiblePlayer = enemy.visiblePlayer || distance < 20;

      if (enemy.alive) {
        const visible = visiblePlayer && !enemy.visiblePlayer;
        const next = nextToPlayer && !enemy.nextToPlayer;

        if (attack) {
          enemy.attack();
        } else if (next) {
          enemy.scream();
        } else if (visible) {
          enemy.walk();
        }
      }

      enemy.visiblePlayer = visiblePlayer;
      enemy.nextToPlayer = nextToPlayer;
      enemy.attacking = attack;
    }
  }

  spawnRifle () {
    const z = random(-this._bounds.front, this._bounds.front);
    const x = random(-this._bounds.side, this._bounds.side);

    this.ak47.arm.position.set(x, 1.75, z);
    this.stage.scene.add(this.ak47.arm);
    this.add(this.rifleRotation);
  }

  rifleRotation () {
    const rifle = this.ak47.arm;
    const distance = rifle.position.distanceTo(this.playerPosition);

    rifle.rotation.y -= 0.01;

    if (distance < 2.5) {
      const colliders = this.getEnemyColliders();
      this.remove(this.rifleRotation);

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
      // this.remove(enemy.update);
      enemy.dispose();
      this.killed++;

      delete this.enemies[index];
      this.enemies.splice(index, 1);

      this.addEnemy();
      this.addEnemy();
    }, 4000);
  }

  addEnemy () {
    const enemy = new Enemy(this.enemyID++, this.enemy, this.animations);
    enemy.playerPosition = this.playerPosition;
    this.add(enemy.update.bind(enemy));
    enemy.setRandomPosition();

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

  add (call) {
    this.calls.push(call);
  }

  loop () {
    this.stats.begin();
    const delta = this._clock.getDelta();

    for (let c = 0; c < this.calls.length; c++) {
      this.calls[c](delta);
    }

    requestAnimationFrame(this.loop.bind(this));
    this.stats.end();
  }

  remove (call) {
    const index = this.calls.indexOf(call);
    console.log('Remove call', index);
    this.calls.splice(index, 1);
  }

  end () {
    document.body.removeChild(this.stats.domElement);
    delete this.stats;
  }
};
