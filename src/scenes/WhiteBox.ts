import type { CharacterSoundConfig, CharacterSound } from '@/characters/types';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import type { WeaponSoundConfig, WeaponSound } from '@/weapons/types';
import { PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { AudioListener } from 'three/src/audio/AudioListener';
import type { Material } from 'three/src/materials/Material';

import { AmbientLight } from 'three/src/lights/AmbientLight';
import { GameEvents, GameEvent } from '@/events/GameEvents';
import { GridHelper } from 'three/src/helpers/GridHelper';
import Stats from 'three/examples/jsm/libs/stats.module';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import { Texture } from 'three/src/textures/Texture';
import type Character from '@/characters/Character';
import { Assets } from '@/loaders/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';
import { Mesh } from 'three/src/objects/Mesh';
import { Clock } from 'three/src/core/Clock';

import type Weapon from '@/weapons/Weapon';
import { Fog } from 'three/src/scenes/Fog';
import Pointer from '@/managers/Pointer';
import Player from '@/characters/Player';
import Viewport from '@/utils/Viewport';
import Enemy from '@/characters/Enemy';
import Camera from '@/managers/Camera';
import { Color } from '@/utils/Color';
import Pistol from '@/weapons/Pistol';
import Rifle from '@/weapons/Rifle';
import Controls from '@/controls';
import RAF from '@/managers/RAF';
import Physics from '@/physics';
import Configs from '@/configs';

interface GridMaterial extends Material {
  transparent: boolean
  opacity: number
}

const SCENE_SIZE = 500.0;
const ORBIT_CONTROLS = false;

export default class WhiteBox
{
  private enemy?: Enemy;
  private stats?: Stats;
  private controls?: Controls;
  private orbit?: OrbitControls;
  private camera!: PerspectiveCamera;

  private readonly clock = new Clock();
  private readonly scene = new Scene();
  private readonly player = new Player();
  private readonly envMap = new Texture();
  private readonly pointer = new Pointer();

  private readonly listener = new AudioListener();
  private readonly rifle = new Rifle(this.envMap);
  private readonly update = this.render.bind(this);
  private readonly pistol = new Pistol(this.envMap);
  private readonly onResize = this.resize.bind(this);

  private readonly onPointerLock = this.requestPointerLock.bind(this);
  private readonly renderer = new WebGLRenderer({ antialias: true, alpha: false });

  public constructor () {
    this.createScene();
    this.createCamera();
    this.createLights();
    this.createGround();

    this.createCharacters();
    this.createColliders();
    this.createRenderer();

    this.createControls();
    this.createStats();
    this.addEvents();
  }

  private createScene (): void {
    this.scene.background = Color.getClass(Color.WHITE);
    this.scene.fog = new Fog(Color.WHITE, ORBIT_CONTROLS ? 10 : 0.1, 50);
  }

  private createCamera (): void {
    this.camera = new PerspectiveCamera(
      45, innerWidth / innerHeight, 0.1, SCENE_SIZE
    );

    this.camera.position.set(2.5, 1.7, 30);
    Camera.object.add(this.listener);
  }

  private createLights (): void {
    const directional = new DirectionalLight(Color.WHITE, 1);
    const ambient = new AmbientLight(Color.WHITE);

    directional.position.set(-5, 10, 15);
    directional.castShadow = true;

    directional.shadow.camera.bottom = -25;
    directional.shadow.camera.right = 25;
    directional.shadow.camera.left = -25;
    directional.shadow.camera.top = 15;

    directional.shadow.mapSize.x = 1024;
    directional.shadow.mapSize.y = 1024;

    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 50;

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  private createGround (): void {
    const ground = new Mesh(
      new BoxGeometry(SCENE_SIZE, SCENE_SIZE, 1.0),
      new MeshPhongMaterial({
        color: Color.WHITE,
        depthWrite: false
      })
    );

    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new GridHelper(SCENE_SIZE, SCENE_SIZE * 0.5, 0.0, 0.0);
    (grid.material as GridMaterial).transparent = true;
    (grid.material as GridMaterial).opacity = 0.25;
    this.scene.add(grid);
  }

  private async createCharacters (): Promise<void> {
    const model = await (new Enemy).loadCharacter(this.envMap);
    this.enemy = new Enemy(model, this.envMap);
    await this.player.loadCharacter(this.envMap);

    this.player.setPistol(this.enemy.hitBox, this.pistol);
    Physics.setCharacter(this.player.collider, 90);
    Physics.setCharacter(this.enemy.collider);

    await this.addWeaponSounds(this.pistol);
    await this.addWeaponSounds(this.rifle);

    this.addCharacterSounds(this.player);
    this.addCharacterSounds(this.enemy);

    this.player.addRifle(this.rifle);
    this.player.pickRifle();

    Physics.pause = false;
    RAF.add(this.update);
    RAF.pause = false;
  }

  private createColliders (): void {
    const halfSize = SCENE_SIZE * 0.5;
    const { position, height } = Configs.Level;

    Physics.createGround(
      [-halfSize, -halfSize],
      [ halfSize,  halfSize]
    );

    Physics.createBounds({
      height,
      y: position.y,
      borders: [
        [-halfSize,  halfSize],
        [ halfSize,  halfSize],
        [ halfSize, -halfSize],
        [-halfSize, -halfSize]
      ]
    });
  }

  private createRenderer (): void {
    document.body.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(innerWidth, innerHeight);

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(Color.PORTAL, 1);

    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
  }

  private createControls (): void {
    if (!ORBIT_CONTROLS) this.controls = new Controls(this.player);

    else {
      this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
      this.orbit.update();
    }
  }

  private createStats (): void {
    if (document.body.lastElementChild?.id !== 'stats') {
      this.stats = Stats();
      this.stats.showPanel(0);

      this.stats.domElement.style.left = 'auto';
      this.stats.domElement.style.right = '0px';
      document.body.appendChild(this.stats.domElement);
    }
  }

  private addEvents (): void {
    Viewport.addResizeCallback(this.onResize);
    document.body.addEventListener('click', this.onPointerLock);

    GameEvents.add('Level::AddObject', this.addGameObject.bind(this));
    GameEvents.add('Game::Pause', this.toggleControls.bind(this, false));
    GameEvents.add('Level::RemoveObject', this.removeGameObject.bind(this));

    GameEvents.add('SFX::Character', this.playCharacter.bind(this));
    GameEvents.add('Enemy::Death', this.enemyDeath.bind(this));
    GameEvents.add('SFX::Weapon', this.playWeapon.bind(this));

    GameEvents.add('Hit::Head', this.enemyHeadHit.bind(this));
    GameEvents.add('Hit::Body', this.enemyBodyHit.bind(this));
    GameEvents.add('Hit::Leg', this.enemyLegHit.bind(this));
  }

  private async loadSounds (sounds: ReadonlyArray<string>): Promise<Array<AudioBuffer>> {
    return Promise.all(sounds.map(Assets.Loader.loadAudio.bind(Assets.Loader)));
  }

  private async addCharacterSounds (character: Character): Promise<void> {
    const sfx = character instanceof Player ? Configs.Player.sounds : Configs.Enemy.sounds;
    const names = Object.keys(sfx) as unknown as Array<CharacterSound>;
    const sounds = await this.loadSounds(Object.values(sfx));

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(this.listener);
      const volume = names[s] === 'death' ? 2.5 : 0.5;

      audio.userData = { name: names[s] };
      character.collider.add(audio);

      audio.setVolume(volume);
      audio.setBuffer(sound);
    });
  }

  private async addWeaponSounds (weapon: Weapon): Promise<void> {
    const sfx = weapon instanceof Pistol ? Configs.Pistol.sounds : Configs.Rifle.sounds;
    const names = Object.keys(sfx) as unknown as Array<WeaponSound>;
    const sounds = await this.loadSounds(Object.values(sfx));

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(this.listener);
      let volume = names[s] === 'bullet' ? 0.25 : 2.5;
      volume = names[s] === 'shoot' ? 5.0 : volume;

      audio.userData = { name: names[s] };
      weapon.object.add(audio);

      audio.setVolume(volume);
      audio.setBuffer(sound);
    });
  }

  private playCharacter (event: GameEvent): void {
    const { sfx, uuid, play } = event.data as CharacterSoundConfig;

    const character = this.player.collider.uuid === uuid
      ? this.player.collider : (this.enemy as Enemy).collider;

    const sound = character.children.find(audio =>
      audio.userData.name === sfx
    ) as PositionalAudio;

    play
      ? !sound.isPlaying && sound.play()
      : sound.isPlaying && sound.stop();
  }

  private playWeapon (event: GameEvent): void {
    const { sfx, pistol, play, delay } = event.data as WeaponSoundConfig;
    const weapon = pistol ? this.pistol.object : this.rifle.object;

    const sound = weapon.children.find(audio =>
      audio.userData.name === sfx
    ) as PositionalAudio;

    play
      ? !sound.isPlaying && sound.play(delay)
      : sound.isPlaying && sound.stop();
  }

  private enemyHeadHit (): void {
    this.enemy?.headHit();
  }

  private enemyBodyHit (): void {
    this.enemy?.bodyHit();
  }

  private enemyLegHit (): void {
    this.enemy?.legHit();
  }

  private enemyDeath (): void {
    delete this.enemy;
  }

  private requestPointerLock (): void {
    if (!this.controls) return;
    this.pointer.requestPointerLock();
    this.toggleControls(true);
  }

  private addGameObject (event: GameEvent): void {
    const object = event.data as Object3D;
    this.scene.add(object);
  }

  private removeGameObject (event: GameEvent): void {
    const object = event.data as Object3D;
    this.scene.remove(object);
  }

  private updateCharacters (player: Vector3, delta: number): void {
    this.player.update(delta);
    this.enemy?.update(delta, player);
  }

  private updateGameObjects (player: Vector3): void {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.updateCharacters(player, delta);
    Physics.update(delta);
    Camera.updateState();
  }

  private toggleControls (enable: boolean) {
    if (!this.controls) return;
    this.controls.pause = !enable;
  }

  private removeEvents (): void {
    document.body.removeEventListener('click', this.onPointerLock);
    Viewport.removeResizeCallback(this.onResize);

    GameEvents.remove('Level::RemoveObject');
    GameEvents.remove('Level::AddObject');
    GameEvents.remove('SFX::Character');

    GameEvents.remove('Enemy::Death');
    GameEvents.remove('SFX::Weapon');
    GameEvents.remove('Game::Pause');

    GameEvents.remove('Hit::Head');
    GameEvents.remove('Hit::Body');
    GameEvents.remove('Hit::Leg');
  }

  private render (): void {
    this.stats?.begin();

    this.updateGameObjects(this.player.location.position);
    if (!this.orbit) this.renderer.render(this.scene, Camera.object);

    else {
      this.orbit.update();
      this.renderer.render(this.scene, this.camera);
    }

    this.stats?.end();
  }

  private resize (): void {
    this.rifle.resize(innerHeight);
    this.pistol.resize(innerHeight);

    if (!this.orbit) Camera.resize();

    else {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    }
  }

  public dispose (): void {
    RAF.remove(this.update);

    this.controls?.dispose();
    this.renderer.dispose();
    this.pointer.dispose();
    this.orbit?.dispose();

    this.player.dispose();
    this.enemy?.dispose();
    this.pistol.dispose();
    this.rifle.dispose();

    this.removeEvents();
    this.scene.clear();
    Physics.dispose();
    Camera.dispose();
    RAF.dispose();

    this.stats?.domElement.remove();
    this.renderer.domElement.remove();
    Camera.object.remove(this.listener);

    while (this.scene.children.length > 0)
      this.scene.remove(this.scene.children[0]);
  }
}
