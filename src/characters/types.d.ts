import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Matrix4 } from 'three/src/math/Matrix4';
import type { Weapon } from '@/weapons/types';
import type Configs from '@/configs';

type CharacterMove         = { speed: number, direction: PlayerDirection };
type CharacterConfig       = typeof Configs.Player | typeof Configs.Enemy;

type PlayerLocation        = { position: Vector3, rotation: number };
type PlayerDirection       = { z0: number, x0: number, x1: number };
type CharacterSound        = keyof PlayerSounds | keyof EnemySounds;

type PlayerAnimations      = keyof typeof Configs.Player.animations;
type EnemyAnimations       = keyof typeof Configs.Enemy.animations;
type EnemyAttackData       = { position: Vector3, damage: number };

type EnemyDeathAnimation   = 'crawlDeath' | 'death' | 'headshot';
type CharacterAnimation    = PlayerAnimations | EnemyAnimations;
type PlayerHitAnimation    = `${Weapon}${HitDirection}Hit`;

type PlayerSounds          = typeof Configs.Player.sounds;
type EnemySounds           = typeof Configs.Enemy.sounds;

type CharacterSoundsConfig = PlayerSounds | EnemySounds;
type HitDirection          = 'Front' | 'Left' | 'Right';

type CharacterSoundConfig = {
  sfx: CharacterSound,
  matrix: Matrix4,
  play: boolean,
  uuid: string
};

// Temporary hack for @types/three v0.145.0:
declare module 'three/examples/jsm/utils/SkeletonUtils' {
  export function clone (source: Object3D): Object3D;
}
