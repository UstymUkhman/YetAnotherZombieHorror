import type { PositionalAudio } from 'three/src/audio/PositionalAudio';
import type { Vector3 } from 'three/src/math/Vector3';
import { Config } from '@/config';

type CharacterAnimations<Animation> = { [key in CharacterAnimation]: Animation };
type CharacterSounds    = Map<PlayerSounds | EnemySounds, PositionalAudio>;

type CharacterConfig    = typeof Config.Player | typeof Config.Enemy;
type Location           = { position: Vector3, rotation: number };
type Direction          = { z0: number, x0: number, x1: number };

type CharacterMove      = { speed: number, direction: Direction };
type PlayerAnimations   = keyof typeof Config.Player.animations;
type EnemyAnimations    = keyof typeof Config.Enemy.animations;
type CharacterAnimation = PlayerAnimations | EnemyAnimations;

type PlayerSounds       = keyof typeof Config.Player.sounds;
type EnemySounds        = keyof typeof Config.Enemy.sounds;

type CharacterSound     = PlayerSounds | EnemySounds;
type Coords             = Readonly<[number, number]>;
type Bounds             = Readonly<Array<Coords>>;
