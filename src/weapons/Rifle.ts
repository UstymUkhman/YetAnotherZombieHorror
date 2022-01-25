import type { Texture } from 'three/src/textures/Texture';
import { PointLight } from 'three/src/lights/PointLight';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Assets } from '@/loaders/AssetsLoader';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';
import type { LevelCoords } from '@/scenes/types';
import { GameEvents } from '@/events/GameEvents';

import { Color } from '@/utils/Color';
import Weapon from '@/weapons/Weapon';

import Settings from '@/settings';
import Configs from '@/configs';
import anime from 'animejs';

export default class Rifle extends Weapon
{
  private readonly light = new PointLight(
    Color.WHITE, 1.0, Configs.Level.depth / 10.0,
    +Settings.getEnvironmentValue('physicalLights') + 1.0
  );

  private readonly halfLightPower = +Settings.getEnvironmentValue('physicalLights') * 70 + 5;

  private readonly position = Configs.Rifle.position as Vector3;
  private readonly rotation = Configs.Rifle.rotation as Euler;
  private readonly maxStock = Configs.Rifle.maxStock;

  private clone?: Assets.GLTF;
  private reloading = false;

  private spawnTime = 0.0;
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

  public override toggleVisibility (hideDelay: number, showDelay: number): void {
    const childMesh = this.model.children[0] as Mesh;

    anime({
      targets: childMesh.material,
      delay: hideDelay,
      easing: 'linear',
      duration: 100,
      opacity: 0.0
    });

    setTimeout(() => anime({
      targets: childMesh.material,
      easing: 'linear',
      duration: 100,
      opacity: 1.0
    }), showDelay);
  }

  public override addAmmo (ammo = Configs.Rifle.magazine): void {
    if (ammo) {
      this.playSound('pick', false);
      const totalAmmo = Math.min(this.inStock + ammo, this.maxStock);
      this.totalAmmo = this.empty ? totalAmmo : totalAmmo + this.loadedAmmo;
    }

    else {
      const toLoad = Math.min(Math.min(
        this.magazine - this.loadedAmmo, this.magazine
      ), this.totalAmmo);

      setTimeout(this.stopReloading.bind(this), 500);
      this.loadedAmmo += toLoad;

      GameEvents.dispatch('Weapon::Reload', {
        loaded: this.loadedAmmo,
        inStock: this.inStock,
        ammo: this.totalAmmo
      });
    }
  }

  public override startReloading (): void {
    this.model.position.set(this.position.x, this.position.y, 0.0);
    this.model.rotation.set(this.rotation.x, this.rotation.y, 0.0);

    this.playSound('reload', true);
    this.reloading = true;
  }

  public override stopReloading (): void {
    this.reloading && this.stopSound('reload');
    this.reloading = false;
    this.reset();
  }

  public update (player: Vector3): void {
    if (!this.spawned || !this.clone) return;
    this.clone.rotation.y -= 0.025;

    const normalizedPower = Math.cos(this.spawnTime += 0.05) + 1.0;
    const playerDistance = this.clone.position.distanceTo(player);
    this.light.power = normalizedPower * this.halfLightPower;

    if (this.inStock < this.maxStock && playerDistance < 2.5) {
      GameEvents.dispatch('Level::RemoveObject', this.clone);
      GameEvents.dispatch('Player::PickRifle', this.clone);
      GameEvents.dispatch('Rifle::Pick', null, true);

      this.clone.remove(this.light);
      this.light.power = 0.0;
      this.spawned = false;
    }
  }

  public spawn (coords: LevelCoords): void {
    const worldScale = Configs.Rifle.worldScale as Vector3;
    this.clone = this.clone || this.getClone();

    this.clone.position.set(coords[0], 1.75, coords[1]);
    this.clone.rotation.set(0.0, 0.0, 0.0);
    this.clone.scale.copy(worldScale);

    GameEvents.dispatch('Level::AddObject', this.clone);
    GameEvents.dispatch('Rifle::Spawn', coords, true);

    this.light.power = this.halfLightPower * 2.0;
    this.clone.add(this.light);

    this.spawnTime = 0.0;
    this.spawned = true;
  }

  private reset (): void {
    this.model.position.copy(this.position);
    this.model.rotation.copy(this.rotation);
  }

  public get onStage (): boolean {
    return this.spawned;
  }

  public override dispose (): void {
    this.light.dispose();
    this.clone?.clear();
    super.dispose();
  }
}
