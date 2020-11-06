import { Config } from '@/config';

type Location = { position: import('@three/math/Vector3').Vector3, rotation: number };
type CharacterAnimations<Animation> = { [key in CharacterAnimation]: Animation };
type PositionalAudio = import('@three/audio/PositionalAudio').PositionalAudio;

type CharacterSounds = Map<PlayerSounds | EnemySounds, PositionalAudio>;
type WeaponSounds    = Map<PistolSounds | RifleSounds, PositionalAudio>;

type CharacterMove      = { speed: number, direction: Direction };
type PlayerAnimations   = keyof typeof Config.Player.animations;
type EnemyAnimations    = keyof typeof Config.Enemy.animations;
type CharacterAnimation = PlayerAnimations | EnemyAnimations;

type CharacterConfig = typeof Config.Player | typeof Config.Enemy;
type WeaponConfig    = typeof Config.Pistol | typeof Config.Rifle;
type Direction       = { z0: number, x0: number, x1: number };

type PlayerSounds = keyof typeof Config.Player.sounds;
type PistolSounds = keyof typeof Config.Pistol.sounds;
type EnemySounds  = keyof typeof Config.Enemy.sounds;
type RifleSounds  = keyof typeof Config.Rifle.sounds;

type CharacterSound = PlayerSounds | EnemySounds;
type WeaponSound    = PistolSounds | RifleSounds;

type Coords = Readonly<[number, number]>;
type Bounds = Readonly<Array<Coords>>;
