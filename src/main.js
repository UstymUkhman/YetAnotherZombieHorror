import Input from '@/managers/Input';
import Game from '@/managers/Game';

import Player from '@/Player';
// import Enemy from '@/Enemy';

import Stage from '@/Stage';

(() => {
  const stage = new Stage();
  Game.add(stage.render.bind(stage));

  const player = new Player(character => {
    stage.scene.add(character);
    stage.createGround();

    Game.add(player.update.bind(player));
    Input.player = player;
  });

  // const zombie = new Enemy(character => {
  //   stage.scene.add(character);
  //   Game.add(zombie.update.bind(zombie));
  // });
})();
