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
    this._zombie = null;

    this.player = null;
    this.enemy = null;
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

    this.enemy = new Enemy(null, null, (character, animations) => {
      const loop = this.add(this.enemy.update.bind(this.enemy));
      this.stage.scene.add(character);

      this._animations = animations;
      this._zombie = character;
      this.enemy.loop = loop;
    });
  }

  onLoaded () {
    Events.remove('loaded');

    setTimeout(() => {
      this.add(Input.update.bind(Input));
      Input.player = this.player;

      this.player.setWeapon(
        this.enemy.colliders,
        this.pistol, false
      );

      this.setCharacters();
      this.stage.createGrid();
      this.add(this.stage.render.bind(this.stage));
    }, 100);
  }

  setCharacters () {
    this.playerPosition = this.player.character.position;
    this.enemy.playerPosition = this.playerPosition;
    this.enemy.character.lookAt(this.playerPosition);

    this._checkPlayerDistance = this.checkPlayerDistance.bind(this);
    this._distanceLoop = this.add(this._checkPlayerDistance);

    setTimeout(() => {
      const grid = this.stage.scene.children.length - 1;
      this.stage.scene.remove(this.stage.scene.children[grid]);
      this.stage.createGrid();
    }, 100);
  }

  checkPlayerDistance () {
    if (!this.enemy) return;

    const enemyPosition = this.enemy.character.position;
    const distance = enemyPosition.distanceTo(this.playerPosition);

    const attack = this.enemy.attacking || distance < 1.75;
    const nextToPlayer = this.enemy.nextToPlayer || distance < 10;
    const visiblePlayer = this.enemy.visiblePlayer || distance < 20;

    if (this.enemy.alive) {
      const visible = visiblePlayer && !this.enemy.visiblePlayer;
      const next = nextToPlayer && !this.enemy.nextToPlayer;

      if (attack && !this.enemy.attacking) {
        this.enemy.attack();
      } else if (next && !this.enemy.crawling) {
        this.enemy.scream();
      } else if (visible && !this.enemy.crawling) {
        this.enemy.walk();
      }
    }

    this.enemy.visiblePlayer = visiblePlayer;
    this.enemy.nextToPlayer = nextToPlayer;
    this.enemy.attacking = attack;
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
      this.remove(this._rifleLoop);
      this.ak47.setToPlayer();

      this.player.setWeapon(
        this.enemy.colliders,
        this.ak47, true
      );
    }
  }

  onHeadshoot () {
    this.enemy.headshot();
    this.removeEnemy(true);
  }

  onBodyHit () {
    const hit = this.player.hit;
    const dead = !this.enemy.bodyHit(hit);

    if (dead) {
      this.removeEnemy();
    }
  }

  onLegHit () {
    const hit = this.player.hit / 2;
    const dead = !this.enemy.legHit(hit);

    if (dead) {
      this.removeEnemy();
    }
  }

  removeEnemy (headshoot = false) {
    const delay = this.enemy.crawling ? 2033 : headshoot ? 4000 : 4366;

    setTimeout(() => {
      this.stage.scene.remove(this.enemy.character);
      this.remove(this.enemy.loop);
      this.enemy.dispose();
      delete this.enemy;

      this.enemy = new Enemy(this._zombie, this._animations);

      setTimeout(() => {
        const loop = this.add(this.enemy.update.bind(this.enemy));
        this.enemy.playerPosition = this.playerPosition;
        this.enemy.character.lookAt(this.playerPosition);

        this.stage.scene.add(this.enemy.character);
        this.enemy.loop = loop;
      }, 2000);
    }, delay);
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
