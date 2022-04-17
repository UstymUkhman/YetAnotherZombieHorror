import type { Texture } from 'three/src/textures/Texture';
import { PointLight } from 'three/src/lights/PointLight';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Assets } from '@/loaders/AssetsLoader';
import type { WeaponConfig } from '@/weapons/types';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';
import { GameEvents } from '@/events/GameEvents';

import { Color } from '@/utils/Color';
import Weapon from '@/weapons/Weapon';
import Settings from '@/settings';
import Configs from '@/configs';
import anime from 'animejs';

export default class Rifle extends Weapon
{
  private readonly halfLightPower = +Settings.getEnvironmentValue('physicalLights') * 70 + 5;

  private readonly light = new PointLight(
    Color.WHITE, 1.0, +!Settings.getEnvironmentValue('physicalLights') * 2.5 + 2.5,
    +Settings.getEnvironmentValue('physicalLights') + 1.0
  );

  private readonly spinePosition = Configs.Rifle.spinePosition as Vector3;
  private readonly spineRotation = Configs.Rifle.spineRotation as Euler;

  private readonly position = Configs.Rifle.position as Vector3;
  private readonly rotation = Configs.Rifle.rotation as Euler;
  private readonly maxStock = Configs.Rifle.maxStock;

  private clone!: Assets.GLTF;
  private reloading = false;
  private appended = false;

  private spawnTime = 0.0;
  private spawned = false;

  public constructor (envMap: Texture) {
    super(Configs.Rifle as WeaponConfig);
    this.load(envMap);
  }

  protected override async load (envMap: Texture): Promise<Assets.GLTF> {
    const clone = await super.load(envMap);

    clone.scale.copy(Configs.Rifle.worldScale as Vector3);
    GameEvents.dispatch('Level::AddObject', clone);
    clone.rotation.set(0.0, 0.0, 0.0);

    this.light.visible = false;
    this.light.power = 0.0;
    clone.visible = false;

    clone.add(this.light);
    this.clone = clone;
    return clone;
  }

  public override setAim (): void {
    this.object.rotation.set(this.rotation.x - 0.1, Math.PI - 0.028, -0.1);
    this.object.position.set(this.position.x, -1.0, -2.0);
  }

  public override cancelAim (): void {
    this.reset();
  }

  public override toggleVisibility (hideDelay: number, showDelay: number): void {
    anime({
      targets: this.mesh.material,
      delay: hideDelay,
      easing: 'linear',
      duration: 100,
      opacity: 0.0
    });

    setTimeout(() => anime({
      targets: this.mesh.material,
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
    this.object.position.set(this.position.x, this.position.y, 0.0);
    this.object.rotation.set(this.rotation.x, this.rotation.y, 0.0);

    this.playSound('reload', true);
    this.reloading = true;
  }

  public override stopReloading (): void {
    this.reloading && this.stopSound('reload');
    this.reloading = false;
    this.reset();
  }

  public update (player: Vector3): void {
    if (!this.spawned) return;
    this.clone.rotation.y -= 0.025;

    const normalizedPower = Math.cos(this.spawnTime += 0.05) + 1.0;
    const playerDistance = this.clone.position.distanceTo(player);
    this.light.power = normalizedPower * this.halfLightPower;

    if (this.inStock < this.maxStock && playerDistance < 2.5) {
      GameEvents.dispatch('Player::PickRifle', this.clone);
      GameEvents.dispatch('Rifle::Pick', null, true);

      this.clone.visible = false;
      this.light.visible = false;
      this.light.power = 0.0;
      this.spawned = false;
    }
  }

  public spawn (coords: LevelCoords): void {
    this.clone.position.set(coords[0], 1.75, coords[1]);
    GameEvents.dispatch('Rifle::Spawn', coords, true);
    this.light.power = this.halfLightPower * 2.0;

    this.clone.visible = true;
    this.light.visible = true;
    this.spawnTime = 0.0;
    this.spawned = true;
  }

  public updatePosition (factor: number): void {
    this.appended && anime({
      targets: this.object.position,
      duration: +!factor * 100,
      x: factor * 10.0 - 10.0,
      easing: 'linear'
    });
  }

  public append (factor: number): void {
    this.object.position.copy(this.spinePosition);
    this.object.rotation.copy(this.spineRotation);

    this.appended = true;
    this.updatePosition(factor);
  }

  public reset (): void {
    this.object.position.copy(this.position);
    this.object.rotation.copy(this.rotation);

    this.appended = false;
  }

  public set visible (visible: boolean) {
    this.mesh.visible = visible;
  }

  public override dispose (): void {
    this.light.dispose();
    this.clone.clear();
    super.dispose();
  }

  public get onStage (): boolean {
    return this.spawned;
  }

  public get mesh (): Mesh {
    return this.object.children[0] as Mesh;
  }
}
