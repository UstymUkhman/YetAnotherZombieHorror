import type { PositionalAudio } from 'three/src/audio/PositionalAudio';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Matrix4 } from 'three/src/math/Matrix4';
import { Config } from '@/config';

type PlayerMovement        = { directions: Directions, running: boolean };
type CharacterConfig       = typeof Config.Player | typeof Config.Enemy;
type CharacterSound        = keyof PlayerSounds | keyof EnemySounds;

type CharacterMove         = { speed: number, direction: Direction };
type PlayerLocation        = { position: Vector3, rotation: number };
type PlayerDirection       = { z0: number, x0: number, x1: number };

type PlayerAnimations      = keyof typeof Config.Player.animations;
type EnemyAnimations       = keyof typeof Config.Enemy.animations;

type CharacterSounds       = Map<CharacterSound, PositionalAudio>;
type CharacterAnimation    = PlayerAnimations | EnemyAnimations;

type PlayerSounds          = typeof Config.Player.sounds;
type EnemySounds           = typeof Config.Enemy.sounds;
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
