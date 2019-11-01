import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

// eslint-disable-next-line no-unused-vars
import Gamepad from '@/managers/Gamepad';
import Input from '@/managers/Input';
import Game from '@/managers/Game';

// import Pistol from '@/weapons/Pistol';
import AK47 from '@/weapons/AK47';

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
        this.player.addCamera(this.stage.camera);
        Game.add(Input.update.bind(Input));
      }

      this.stage.scene.add(character);
      Input.player = this.player;

      this.weapon = new AK47(() => {
        const colliders = this.zombie.colliders;
        this.weapon.camera = this.stage.camera;

        this.player.setWeapon(
          this.weapon,
          colliders,
          true
        );

        this.stage.createGrid();
        this.onCharacterLoad();
      });

      // this.weapon = new Pistol(() => {
      //   const colliders = this.zombie.colliders;
      //   this.weapon.camera = this.stage.camera;

      //   this.player.setWeapon(
      //     this.weapon,
      //     colliders
      //   );

      //   this.stage.createGrid();
      //   this.onCharacterLoad();
      // });
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

      Game.setCharacters(this.player, this.zombie);
      Game.add(this.stage.render.bind(this.stage));
      this.stage.createGrid();
    }

    this.loadedCharacters++;
  }
}

// eslint-disable-next-line no-new
new AnotherDumbZombieGame();
