import type { PositionalAudio } from 'three/src/audio/PositionalAudio';
import type { Matrix4 } from 'three/src/math/Matrix4';
import Configs from '@/configs';

type BulletConfig       = typeof Configs.Pistol.bullet | typeof Configs.Rifle.bullet;
type WeaponSoundConfig  = { matrix: Matrix4, sfx: WeaponSound, play: boolean };
type WeaponConfig       = typeof Configs.Pistol | typeof Configs.Rifle;

type WeaponSound        = keyof PistolSounds | keyof RifleSounds;
type WeaponSounds       = Map<WeaponSound, PositionalAudio>;

type PistolSounds       = typeof Configs.Pistol.sounds;
type RifleSounds        = typeof Configs.Rifle.sounds;

type WeaponSoundsConfig = PistolSounds | RifleSounds;
type Recoil             = { x: number, y: number };
