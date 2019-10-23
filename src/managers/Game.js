import Stats from 'three/examples/js/libs/stats.min';
import { Clock } from '@three/core/Clock';

class Game {
  constructor () {
    this._clock = new Clock();
    this.createStats();

    this.player = null;
    this.enemy = null;

    this.calls = [];
    this.loop();
  }

  createStats () {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.domElement);
  }

  setCharacters (player, enemy) {
    this.enemy = enemy;
    this.player = player;

    this.playerPosition = player.character.position;
    enemy.playerPosition = this.playerPosition;
    enemy.character.lookAt(this.playerPosition);

    this._checkPlayerDistance = this.checkPlayerDistance.bind(this);
    this._distanceLoop = this.add(this._checkPlayerDistance);
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

export default new Game();
