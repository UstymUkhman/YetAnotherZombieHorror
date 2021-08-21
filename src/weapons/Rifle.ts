import type { Texture } from 'three/src/textures/Texture';
import type { LevelCoords } from '@/environment/types';

import type { Vector3 } from 'three/src/math/Vector3';
import type { Assets } from '@/loaders/AssetsLoader';

import type { Euler } from 'three/src/math/Euler';
import { GameEvents } from '@/events/GameEvents';

import Weapon from '@/weapons/Weapon';
import Configs from '@/configs';

export default class Rifle extends Weapon
{
  private readonly position = Configs.Rifle.position as Vector3;
  private readonly rotation = Configs.Rifle.rotation as Euler;
  private readonly maxStock = Configs.Rifle.maxStock;

  private clone?: Assets.GLTF;
  private reloading = false;
  private spawned = false;

  public constructor (envMap: Texture) {
    super(Configs.Rifle, envMap);
  }

  public override setAim (): void {
    this.model.rotation.set(this.rotation.x - 0.1, Math.PI - 0.028, -0.1);
    this.model.position.set(this.position.x, -1.0, -2.0);
  }

  public override cancelAim (): void {
    this.reset();
  }

  public override startReloading (): void {
    this.model.position.set(this.position.x, this.position.y, 0);
    this.model.rotation.set(this.rotation.x, this.rotation.y, 0);

    this.playSound('reload', true);
    this.reloading = true;
  }

  public override addAmmo (ammo = Configs.Rifle.magazine): void {
    if (ammo) this.totalAmmo = Math.min(this.inStock + ammo, this.maxStock);

    else {
      const toLoad = Math.min(this.magazine - this.loadedAmmo, this.magazine);
      this.totalAmmo = Math.max(this.totalAmmo - toLoad, 0);

      setTimeout(this.stopReloading.bind(this), 500);
      this.loadedAmmo += toLoad;

      GameEvents.dispatch('Weapon::Reload', {
        loaded: this.loadedAmmo,
        inStock: this.inStock,
        ammo: this.totalAmmo
      });
    }
  }

  public override stopReloading (): void {
    this.reloading && this.stopSound('reload');
    this.reloading = false;
    this.reset();
  }

  public update (player: Vector3): void {
    if (!this.spawned || !this.clone) return;
    this.clone.rotation.y -= 0.025;

    const playerDistance = this.clone.position.distanceTo(player);

    if (this.inStock < this.maxStock && playerDistance < 2.5) {
      GameEvents.dispatch('Rifle::Pick', this.clone, true);
      this.spawned = false;
    }
  }

  public spawn (coords: LevelCoords): void {
    const worldScale = Configs.Rifle.worldScale as Vector3;
    this.clone = this.clone || this.getClone();

    this.clone.position.set(coords[0], 1.75, coords[1]);
    this.clone.scale.copy(worldScale);
    this.clone.rotation.set(0, 0, 0);

    GameEvents.dispatch('Level::AddModel', this.clone);
    GameEvents.dispatch('Rifle::Spawn', coords, true);

    this.spawned = true;
  }

  private reset (): void {
    this.model.position.copy(this.position);
    this.model.rotation.copy(this.rotation);
  }

  public get onStage (): boolean {
    return this.spawned;
  }
}
