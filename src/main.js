import Input from '@/managers/Input';
import Game from '@/managers/Game';

import Player from '@/Player';
import Stage from '@/Stage';

(() => {
  const stage = new Stage();
  Game.add(stage.render.bind(stage));

  const player = new Player(character => {
    stage.createGround();
    stage.scene.add(character);

    Game.add(player.update.bind(player));
    Input.player = player;
  });
})();
