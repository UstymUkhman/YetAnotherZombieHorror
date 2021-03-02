type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;
type Vector3 = import('three/src/math/Vector3').Vector3;
type Euler = import('three/src/math/Euler').Euler;
import type { Coords } from '@/types.d';

import { GameEvents } from '@/managers/GameEvents';
import Weapon from '@/weapons/Weapon';
import { Config } from '@/config';

export default class Rifle extends Weapon {
  private readonly position = Config.Rifle.position as Vector3;
  private readonly rotation = Config.Rifle.rotation as Euler;
  private readonly maxStock = Config.Rifle.maxStock;

  private reloading = false;
  private spawned = false;
  private clone?: GLTF;

  public constructor () {
    super(Config.Rifle);
  }

  /** @Override */
  public setAim (): void {
    this.model.rotation.set(this.rotation.x, Math.PI, -0.1);
    this.model.position.set(this.position.x, 0.0, -1.0);
  }

  /** @Override */
  public cancelAim (): void {
    this.reset();
  }

  /** @Override */
  public startReloading (): void {
    this.model.position.set(this.position.x, this.position.y, 0);
    this.model.rotation.set(this.rotation.x, this.rotation.y, 0);

    this.playSound('reload', true);
    this.reloading = true;
  }

  /** @Override */
  public addAmmo (ammo = Config.Rifle.magazine): void {
    if (ammo) this.totalAmmo = Math.min(this.inStock + ammo, this.maxStock);

    else {
      const toLoad = Math.min(this.magazine - this.loadedAmmo, this.magazine);
      this.totalAmmo = Math.max(this.totalAmmo - toLoad, 0);

      setTimeout(this.stopReloading.bind(this), 500);
      this.loadedAmmo += toLoad;

      GameEvents.dispatch('weapon:reload', {
        loaded: this.loadedAmmo,
        inStock: this.inStock,
        ammo: this.totalAmmo
      });
    }
  }

  /** @Override */
  public stopReloading (): void {
    this.reloading && this.stopSound('reload');
    this.reloading = false;
    this.reset();
  }

  public update (player: Vector3): void {
    if (!this.spawned || !this.clone) return;
    this.clone.rotation.y -= 0.025;

    const playerDistance = this.clone.position.distanceTo(player);

    if (this.inStock < this.maxStock && playerDistance < 2.5) {
      GameEvents.dispatch('weapon:pick', this.clone);
      GameEvents.dispatch('rifle:pick');
      this.spawned = false;
    }
  }

  public spawn (coords: Coords): void {
    const worldScale = Config.Rifle.worldScale as Vector3;
    this.clone = this.clone || this.getClone();

    this.clone.position.set(coords[0], 1.75, coords[1]);
    this.clone.scale.copy(worldScale);
    this.clone.rotation.set(0, 0, 0);

    GameEvents.dispatch('add:object', this.clone);
    GameEvents.dispatch('rifle:spawn', coords);

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
