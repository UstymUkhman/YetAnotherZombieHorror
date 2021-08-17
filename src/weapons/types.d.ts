import type { PositionalAudio } from 'three/src/audio/PositionalAudio';
import type { Matrix4 } from 'three/src/math/Matrix4';
import Config from '@/config';

type WeaponSoundConfig  = { matrix: Matrix4, sfx: WeaponSound, play: boolean };
type WeaponConfig       = typeof Config.Pistol | typeof Config.Rifle;

type WeaponSound        = keyof PistolSounds | keyof RifleSounds;
type WeaponSounds       = Map<WeaponSound, PositionalAudio>;

type PistolSounds       = typeof Config.Pistol.sounds;
type RifleSounds        = typeof Config.Rifle.sounds;

type WeaponSoundsConfig = PistolSounds | RifleSounds;
type Recoil             = { x: number, y: number };
