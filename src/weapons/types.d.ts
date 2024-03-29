import type { Matrix4 } from 'three/src/math/Matrix4';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Mesh } from 'three/src/objects/Mesh';
import Configs from '@/configs';

type BulletConfig       = typeof Configs.Pistol.bullet | typeof Configs.Rifle.bullet;
type FireConfig         = typeof Configs.Pistol.fire   | typeof Configs.Rifle.fire;

type WeaponConfig       = typeof Configs.Pistol & typeof Configs.Rifle;
type WeaponSound        = keyof PistolSounds | keyof RifleSounds;

type PistolSounds       = typeof Configs.Pistol.sounds;
type RifleSounds        = typeof Configs.Rifle.sounds;

type WeaponSoundsConfig = PistolSounds | RifleSounds;
type Recoil             = { x: number, y: number };
type BulletPath         = Mesh | undefined;

type SmokeParticle = Particle & {
  position: Vector3,
  velocity: number
};

type FireParticle = Particle & {
  size: number
};

type WeaponSoundConfig = {
  pistol?: boolean,
  sfx: WeaponSound,
  matrix: Matrix4,
  delay?: number,
  play: boolean
};

type SoundOptions = {
  pistol?: boolean,
  delay?: number,
  stop: boolean
};

export enum Weapon {
  Pistol = 'pistol',
  Rifle = 'rifle'
}

type HitDamage = {
  head: number,
  body: number,
  leg: number
};

type Particle = {
  currentSize: number,
  rotation: number,
  maxLife: number,

  alpha: number,
  blend: number,
  life: number
};

type HitData = {
  headshot: boolean,
  damage: number,
  enemy: number
};
