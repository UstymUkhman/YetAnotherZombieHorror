import Game from '@/managers/Game';
import Player from '@/Player';
import Stage from '@/Stage';

(() => {
  const stage = new Stage();
  Game.add(stage.render.bind(stage));

  // eslint-disable-next-line no-unused-vars
  const player = new Player(character => {
    stage.createGround();
    stage.scene.add(character);
    Game.add(player.update.bind(player));
  });
})();
