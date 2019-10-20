import Input from '@/managers/Input';
import Game from '@/managers/Game';

import Player from '@/Player';
import Enemy from '@/Enemy';

import Stage from '@/Stage';
const FREE_CAMERA = false;

class AnotherDumbZombieGame {
  constructor () {
    this.loadedCharacters = 0;
    this.stage = new Stage(FREE_CAMERA);

    Player.setBounds(this.stage.bounds);
    Enemy.setBounds(this.stage.bounds);

    this.createCharacters();

    if (!FREE_CAMERA) {
      this.stage.element.addEventListener('click', Input.requestPointerLock);
    }
  }

  createCharacters () {
    this.player = new Player(character => {
      Game.add(this.player.update.bind(this.player));

      if (!FREE_CAMERA) {
        Game.add(Input.updateRotation.bind(Input));
        this.player.addCamera(this.stage.camera);
      }

      this.stage.scene.add(character);
      Input.player = this.player;

      this.stage.createGrid();
      this.onCharacterLoad();
    });

    this.zombie = new Enemy(character => {
      Game.add(this.zombie.update.bind(this.zombie));
      this.stage.scene.add(character);
      this.onCharacterLoad();
    });
  }

  onCharacterLoad () {
    if (this.loadedCharacters) {
      const grid = this.stage.scene.children.length - 1;
      this.stage.scene.remove(this.stage.scene.children[grid]);

      this.zombie.playerPosition = this.player.character.position;
      Game.add(this.stage.render.bind(this.stage));
      this.stage.createGrid();
    }

    this.loadedCharacters++;
  }
}

// eslint-disable-next-line no-new
new AnotherDumbZombieGame();
