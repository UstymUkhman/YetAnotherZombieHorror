import type { CharacterSoundConfig, CharacterSound, EnemyAttackData, HitDirection } from '@/characters/types';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import type { WeaponSoundConfig, WeaponSound } from '@/weapons/types';
import { PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AudioListener } from 'three/src/audio/AudioListener';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { GameEvents, GameEvent } from '@/events/GameEvents';
import Stats from 'three/examples/jsm/libs/stats.module';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import { Texture } from 'three/src/textures/Texture';
import type Character from '@/characters/Character';
import { degToRad } from 'three/src/math/MathUtils';
import { Assets } from '@/loaders/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';
import { Mesh } from 'three/src/objects/Mesh';
import { Clock } from 'three/src/core/Clock';
import { Material } from '@/utils/Material';
import type Enemy from '@/characters/Enemy';
import type Weapon from '@/weapons/Weapon';
import { Fog } from 'three/src/scenes/Fog';
import Pointer from '@/managers/Pointer';
import Enemies from '@/managers/Enemies';
import Player from '@/characters/Player';
import Viewport from '@/utils/Viewport';
import Camera from '@/managers/Camera';
import { Color } from '@/utils/Color';
import Pistol from '@/weapons/Pistol';
import Rifle from '@/weapons/Rifle';
import { PI } from '@/utils/Number';
import Controls from '@/controls';
import RAF from '@/managers/RAF';
import Physics from '@/physics';
import Configs from '@/configs';

const ORBIT_CONTROLS = false;
const SCENE_SIZE = 500.0;

export default class WhiteBox
{
  private stats?: Stats;
  private enemies!: Enemies;
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

  private readonly onKeyRelease = this.onKeyUp.bind(this);
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
    const directional = new DirectionalLight(Color.WHITE);
    const ambient = new AmbientLight(Color.WHITE, 0.25);

    directional.position.set(-2.5, 12.5, 20.0);

    directional.shadow.camera.bottom = -25.0;
    directional.shadow.camera.right = 25.0;
    directional.shadow.camera.left = -25.0;
    directional.shadow.camera.top = 25.0;

    directional.shadow.camera.near = 1.0;
    directional.shadow.camera.far = 25.0;

    directional.shadow.mapSize.x = 2048;
    directional.shadow.mapSize.y = 2048;

    directional.castShadow = true;
    this.scene.add(directional);
    this.scene.add(ambient);
  }

  private createGround (): void {
    const ground = new Mesh(
      new PlaneGeometry(SCENE_SIZE, SCENE_SIZE),
      new Material.Ground({ color: Color.WHITE })
    );

    ground.receiveShadow = true;
    ground.rotateX(-PI.d2);
    this.scene.add(ground);
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
    document.body.addEventListener('keyup', this.onKeyRelease);
    document.body.addEventListener('click', this.onPointerLock);

    GameEvents.add('Enemy::Attack', this.onPlayerHit.bind(this));
    GameEvents.add('Level::AddObject', this.addGameObject.bind(this));
    GameEvents.add('Game::Pause', this.toggleControls.bind(this, false));
    GameEvents.add('Level::RemoveObject', this.removeGameObject.bind(this));

    GameEvents.add('SFX::Character', this.playCharacter.bind(this));
    GameEvents.add('Enemy::Active', this.onEnemyActive.bind(this));
    GameEvents.add('Enemy::Spawn', this.onEnemySpawn.bind(this));
    GameEvents.add('SFX::Weapon', this.playWeapon.bind(this));
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

  private async createCharacters (): Promise<void> {
    this.enemies = new Enemies(this.envMap);
    await this.player.loadCharacter(this.envMap);
    Physics.setCharacter(this.player.collider, 90);

    await this.addWeaponSounds(this.pistol);
    await this.addWeaponSounds(this.rifle);

    this.player.setPistol([], this.pistol);
    this.addCharacterSounds(this.player);

    this.player.addRifle(this.rifle);
    this.player.pickRifle();

    Physics.pause = false;
    RAF.add(this.update);
    RAF.pause = false;
  }

  private playCharacter (event: GameEvent): void {
    const { sfx, uuid, play } = event.data as CharacterSoundConfig;

    const character = this.player.collider.uuid !== uuid
      ? (this.enemies.getEnemy(uuid) as Enemy).collider
      : this.player.collider;

    const sound = character.children.find(audio =>
      audio.userData.name === sfx
    ) as PositionalAudio;

    play
      ? !sound.isPlaying && sound.play()
      : sound.isPlaying && sound.stop();
  }

  private onEnemySpawn (event: GameEvent): void {
    const enemy = event.data as Enemy;
    this.addCharacterSounds(enemy);
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

  private onKeyUp (event: KeyboardEvent): void {
    event.key === 'f' && this.rifle.addAmmo();
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
    this.enemies.update(delta, player);
  }

  private updateGameObjects (player: Vector3): void {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.updateCharacters(player, delta);
    Physics.update(delta);
    Camera.updateState();
  }

  private onPlayerHit (event: GameEvent): void {
    const orientation = degToRad(this.player.location.rotation);
    const { position, damage } = event.data as EnemyAttackData;

    let angle = Math.atan2(
      position.z - this.player.location.position.z,
      position.x - this.player.location.position.x
    );

    let direction: HitDirection = 'Front';

    if (Math.abs(orientation) > PI.m075) {
      angle = Math.abs(angle);

      direction = angle < PI.d4 ? 'Right'
        : angle > PI.m075 ? 'Left' : 'Front';
    }

    else if (orientation < -PI.d4 && orientation > -PI.m075) {
      angle *= -1.0;

      direction = angle < -PI.d4 && angle > -PI.m075 ? 'Right'
        : angle < PI.m075 && angle > PI.d4 ? 'Left' : 'Front';
    }

    else if (Math.abs(orientation) < PI.d4) {
      angle = Math.abs(angle);

      direction = angle > PI.m075 ? 'Right'
      : angle < PI.d4 ? 'Left' : 'Front';
    }

    else if (orientation < PI.m075 && orientation > PI.d4) {
      angle *= -1.0;

      direction = angle < PI.m075 && angle > PI.d4 ? 'Right'
        : angle < -PI.d4 && angle > -PI.m075 ? 'Left' : 'Front';
    }

    this.player.hit(direction, damage);
  }

  private toggleControls (enable: boolean) {
    if (!this.controls) return;
    this.controls.pause = !enable;
  }

  private requestPointerLock (): void {
    if (!this.controls) return;
    this.pointer.requestPointerLock();
    this.toggleControls(true);
  }

  private onEnemyActive (): void {
    this.player.setTargets(this.enemies.colliders);
  }

  private removeEvents (): void {
    document.body.removeEventListener('click', this.onPointerLock);
    document.body.removeEventListener('keyup', this.onKeyRelease);
    Viewport.removeResizeCallback(this.onResize);

    GameEvents.remove('Level::RemoveObject');
    GameEvents.remove('Level::AddObject');
    GameEvents.remove('SFX::Character');
    GameEvents.remove('Enemy::Attack');

    GameEvents.remove('Enemy::Active');
    GameEvents.remove('Enemy::Spawn');
    GameEvents.remove('SFX::Weapon');
    GameEvents.remove('Game::Pause');
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

    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;

    this.camera.updateProjectionMatrix();
    !this.orbit && Camera.resize();
  }

  public dispose (): void {
    RAF.remove(this.update);

    this.controls?.dispose();
    this.renderer.dispose();
    this.pointer.dispose();
    this.enemies.dispose();

    this.orbit?.dispose();
    this.player.dispose();
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
