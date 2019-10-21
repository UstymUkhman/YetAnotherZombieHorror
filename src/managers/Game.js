import { Clock } from '@three/core/Clock';

class Game {
  constructor () {
    this._clock = new Clock();
    this.player = null;
    this.enemy = null;

    this.calls = [];
    this.loop();
  }

  setCharacters (player, enemy) {
    this.enemy = enemy;
    this.player = player;

    this.playerPosition = player.character.position;
    enemy.playerPosition = player.character.position;

    // this._checkPlayerDistance = this.checkPlayerDistance.bind(this);
    // this._distanceLoop = this.add(this._checkPlayerDistance);
  }

  checkPlayerDistance () {
    const enemyPosition = this.enemy.character.position;
    const distance = enemyPosition.distanceTo(this.playerPosition);

    console.log('Distance From Player', distance);
  }

  add (call) {
    this.calls.push(call);
    return this.calls.length - 1;
  }

  loop () {
    const delta = this._clock.getDelta();

    for (let c = 0; c < this.calls.length; c++) {
      this.calls[c](delta);
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  remove (call) {
    this.calls.splice(call, 1);
  }
};

export default new Game();
