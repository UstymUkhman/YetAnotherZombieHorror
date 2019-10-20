import Input from '@/managers/Input';
import Game from '@/managers/Game';

import Player from '@/Player';
import Enemy from '@/Enemy';

import Stage from '@/Stage';
const FREE_CAMERA = false;

(() => {
  let loadedCharacters = 0;
  const stage = new Stage(FREE_CAMERA);

  Player.setBounds(stage.bounds);
  Enemy.setBounds(stage.bounds);

  function onCharacterLoad () {
    if (loadedCharacters) {
      const grid = stage.scene.children.length - 1;
      stage.scene.remove(stage.scene.children[grid]);

      Game.add(stage.render.bind(stage));
      stage.createGrid();
    }

    loadedCharacters++;
  }

  const player = new Player(character => {
    Game.add(Input.updateRotation.bind(Input));
    Game.add(player.update.bind(player));

    if (!FREE_CAMERA) {
      player.addCamera(stage.camera);
    }

    stage.scene.add(character);
    Input.player = player;

    stage.createGrid();
    onCharacterLoad();
  });

  const zombie = new Enemy(character => {
    Game.add(zombie.update.bind(zombie));
    stage.scene.add(character);
    onCharacterLoad();
  });

  if (!FREE_CAMERA) {
    stage.element.addEventListener('click', Input.requestPointerLock);
  }
})();
