import Stats from 'three/examples/js/libs/stats.min';
import { Clock } from '@three/core/Clock';

import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

import Events from '@/managers/Events';
import Input from '@/managers/Input';

import Pistol from '@/weapons/Pistol';
// import AK47 from '@/weapons/AK47';
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
    // this.ak47 = new AK47(this.stage.camera);

    this.player = new Player(character => {
      this.add(this.player.update.bind(this.player));
      this.player.addCamera(this.stage.camera);
      this.stage.scene.add(character);
    });

    this.enemy = new Enemy(null, character => {
      this.add(this.enemy.update.bind(this.enemy));
      this.stage.scene.add(character);
      this._zombie = character;
    });
  }

  onLoaded () {
    Events.remove('loaded');

    setTimeout(() => {
      this.add(Input.update.bind(Input));
      Input.player = this.player;

      this.player.setWeapon(
        this.enemy.colliders,
        this.pistol
      );

      // this.player.setWeapon(
      //   this.enemy.colliders,
      //   this.ak47, true
      // );

      this.stage.createGrid();
      this.setCharacters(this.player, this.enemy);
      this.add(this.stage.render.bind(this.stage));
    }, 100);
  }

  setCharacters (player, enemy) {
    this.enemy = enemy;
    this.player = player;

    this.playerPosition = player.character.position;
    enemy.playerPosition = this.playerPosition;
    enemy.character.lookAt(this.playerPosition);

    this._checkPlayerDistance = this.checkPlayerDistance.bind(this);
    this._distanceLoop = this.add(this._checkPlayerDistance);

    setTimeout(() => {
      const grid = this.stage.scene.children.length - 1;
      this.stage.scene.remove(this.stage.scene.children[grid]);
      this.stage.createGrid();

      // this.pistol.spawnMagazine(this._bounds, magazine => {
      //   this.stage.scene.add(magazine);
      // });
    }, 100);
  }

  checkPlayerDistance () {
    const enemyPosition = this.enemy.character.position;
    const distance = enemyPosition.distanceTo(this.playerPosition);

    const attack = this.enemy.attacking || distance < 1.75;
    const nextToPlayer = this.enemy.nextToPlayer || distance < 10;
    const visiblePlayer = this.enemy.visiblePlayer || distance < 20;

    if (attack && !this.enemy.attacking) {
      this.enemy.attack();
    } else if (nextToPlayer && !this.enemy.nextToPlayer) {
      this.enemy.scream();
    } else if (visiblePlayer && !this.enemy.visiblePlayer) {
      this.enemy.walk();
    }

    this.enemy.visiblePlayer = visiblePlayer;
    this.enemy.nextToPlayer = nextToPlayer;
    this.enemy.attacking = attack;
  }

  onHeadshoot () {
    this.enemy.headshot();
  }

  onBodyHit () {
    // this.enemy.death();
  }

  onLegHit () { }

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
