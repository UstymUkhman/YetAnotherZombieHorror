import Stats from 'three/examples/js/libs/stats.min';
import { Clock } from '@three/core/Clock';
import { random } from '@/utils/number';

import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

import Events from '@/managers/Events';
import Input from '@/managers/Input';

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

    this._animations = null;
    this._rifleLoop = null;
    this.removing = false;
    this._zombie = null;

    this.player = null;
    this.enemies = [];
    this.enemyID = 0;
    this.killed = 0;
    this.calls = [];

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
      const loop = this.add(this.player.update.bind(this.player));
      this.player.addCamera(this.stage.camera);
      this.stage.scene.add(character);
      this.player.loop = loop;
    });

    const enemy = new Enemy(null, null, this.enemyID++, (character, animations) => {
      const loop = this.add(enemy.update.bind(enemy));
      this.stage.scene.add(character);

      this._animations = animations;
      this._zombie = character;
      enemy.loop = loop;
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
    if (this.removing) return;
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

    this._rifleRotation = this.rifleRotation.bind(this);
    this._rifleLoop = this.add(this._rifleRotation);
  }

  rifleRotation () {
    const rifle = this.ak47.arm;
    const distance = rifle.position.distanceTo(this.playerPosition);

    rifle.rotation.y -= 0.01;

    if (distance < 2.5) {
      const colliders = this.getEnemyColliders();
      this.remove(this._rifleLoop);

      this.ak47.setToPlayer();
      this.player.setWeapon(colliders, this.ak47, true);
    }
  }

  getEnemyColliders () {
    const colliders = [];

    for (let e = 0; e < this.enemies.length; e++) {
      colliders.push(...this.enemies[e].colliders);
    }

    return colliders;
  }

  onHeadshoot (event) {
    const index = event.data - this.killed;
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (this.removing || !alive) return;

    enemy.headshot();
    this.removeEnemy(index);
  }

  onBodyHit (event) {
    const index = event.data - this.killed;
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (this.removing || !alive) return;

    const hit = this.player.hit;
    const dead = !enemy.bodyHit(hit);

    if (dead) {
      this.removeEnemy(index);
    }
  }

  onLegHit (event) {
    const index = event.data - this.killed;
    const enemy = this.enemies[index];
    const alive = enemy && enemy.alive;

    if (this.removing || !alive) return;

    const hit = this.player.hit / 2;
    const dead = !enemy.legHit(hit);

    if (dead) {
      this.removeEnemy(index);
    }
  }

  removeEnemy (id) {
    const enemy = this.enemies[id];
    // this.removing = true;

    setTimeout(() => {
      this.stage.scene.remove(enemy.character);
      this.remove(enemy.loop);
      enemy.dispose();
      this.killed++;

      delete this.enemies[id];
      this.enemies.splice(id, 1);

      this.addEnemy();
      // this.removing = false;
    }, 4000);
  }

  addEnemy () {
    const enemy = new Enemy(this._zombie, this._animations, this.enemyID++);
    const loop = this.add(enemy.update.bind(enemy));

    enemy.playerPosition = this.playerPosition;
    enemy.character.lookAt(this.playerPosition);
    enemy.setRandomPosition();

    this.stage.scene.add(enemy.character);
    this.enemies.push(enemy);
    enemy.loop = loop;

    const colliders = this.getEnemyColliders();
    this.player.weapon.targets = colliders;
  }

  add (call) {
    this.calls.push(call);
    return this.calls.length - 1;
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
    this.calls.splice(call, 1);
  }

  end () {
    document.body.removeChild(this.stats.domElement);
    delete this.stats;
  }
};
