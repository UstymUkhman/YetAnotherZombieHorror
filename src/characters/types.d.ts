import type { PositionalAudio } from 'three/src/audio/PositionalAudio';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Matrix4 } from 'three/src/math/Matrix4';
import Configs from '@/configs';

type PlayerMovement        = { directions: Directions, running: boolean };
type CharacterConfig       = typeof Configs.Player | typeof Configs.Enemy;
type CharacterSound        = keyof PlayerSounds | keyof EnemySounds;

type CharacterMove         = { speed: number, direction: Direction };
type PlayerLocation        = { position: Vector3, rotation: number };
type PlayerDirection       = { z0: number, x0: number, x1: number };

type PlayerAnimations      = keyof typeof Configs.Player.animations;
type EnemyAnimations       = keyof typeof Configs.Enemy.animations;

type CharacterSounds       = Map<CharacterSound, PositionalAudio>;
type CharacterAnimation    = PlayerAnimations | EnemyAnimations;

type PlayerSounds          = typeof Configs.Player.sounds;
type EnemySounds           = typeof Configs.Enemy.sounds;
type CharacterSoundsConfig = PlayerSounds | EnemySounds;

type CharacterAnimations<Animation> = {
  [key in CharacterAnimation]: Animation
};

type CharacterSoundConfig = {
  sfx: WeaponSound,
  matrix: Matrix4,
  player: boolean,
  play: boolean
};
