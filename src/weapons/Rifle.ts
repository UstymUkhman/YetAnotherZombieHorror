import type { Texture } from 'three/src/textures/Texture';
import { PointLight } from 'three/src/lights/PointLight';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Assets } from '@/loaders/AssetsLoader';
import type { WeaponConfig } from '@/weapons/types';

import type { Mesh } from 'three/src/objects/Mesh';
import type { LevelCoords } from '@/scenes/types';
import type { Euler } from 'three/src/math/Euler';
import { GameEvents } from '@/events/GameEvents';

import { Color } from '@/utils/Color';
import Weapon from '@/weapons/Weapon';
import Settings from '@/settings';
import Configs from '@/configs';
import anime from 'animejs';

export default class Rifle extends Weapon
{
  private readonly halfLightPower = +Settings.getPerformanceValue('physicalLights') * 70 + 5;

  private readonly light = new PointLight(
    Color.WHITE, 1.0, +!Settings.getPerformanceValue('physicalLights') * 2.5 + 2.5,
    +Settings.getPerformanceValue('physicalLights') + 1.0
  );

  private readonly spinePosition = Configs.Rifle.spinePosition as Vector3;
  private readonly spineRotation = Configs.Rifle.spineRotation as Euler;

  private readonly position = Configs.Rifle.position as Vector3;
  private readonly rotation = Configs.Rifle.rotation as Euler;

  private readonly damage = Configs.Gameplay.damage.rifle;
  private readonly maxStock = Configs.Rifle.maxStock;

  private clone!: Assets.GLTF;
  private spine!: Assets.GLTF;

  private appended = false;
  private spawnTime = 0.0;
  private spawned = false;

  public constructor (envMap: Texture) {
    super(Configs.Rifle as WeaponConfig);
    this.load(envMap);
  }

  protected override async load (envMap: Texture): Promise<Assets.GLTF> {
    const clone = await super.load(envMap);
    this.spine = clone.clone();

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
    anime({
      targets: this.object.rotation,
      easing: 'easeInOutSine',
      x: this.rotation.x,
      y: this.rotation.y,
      z: this.rotation.z,
      duration: 50.0,
      delay: 50.0
    });

    anime({
      targets: this.object.position,
      easing: 'easeInOutSine',
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      duration: 50.0,
      delay: 50.0
    });
  }

  public override toggleVisibility (hide: number, show: number, duration = 100.0): void {
    const { material } = this.object.children[0] as Mesh;

    anime({
      targets: material,
      easing: 'linear',
      opacity: 0.0,
      delay: hide,
      duration
    });

    setTimeout(() => anime({
      targets: material,
      easing: 'linear',
      opacity: 1.0,
      duration
    }), show);
  }

  public override addAmmo (ammo = Configs.Rifle.magazine): void {
    if (ammo) {
      this.playSound('pick', { stop: false });
      const totalAmmo = Math.min(this.inStock + ammo, this.maxStock);
      this.totalAmmo = totalAmmo + +!this.empty * this.loadedAmmo;
    }

    else {
      const toLoad = Math.min(Math.min(
        this.magazine - this.loadedAmmo, this.magazine
      ), this.totalAmmo);

      this.loadedAmmo += toLoad;

      GameEvents.dispatch('Weapon::Reload', {
        loaded: this.loadedAmmo,
        inStock: this.inStock,
        ammo: this.totalAmmo
      });
    }
  }

  public override getDamage (index: number): number {
    const { head, body, leg } = this.damage;
    return !index ? head : index === 1 ? body : leg;
  }

  public override startReloading (): void {
    this.object.position.set(this.position.x, this.position.y, 0.0);
    this.object.rotation.set(this.rotation.x, this.rotation.y, 0.0);
    this.playSound('reload', { stop: true });
  }

  public override stopReloading (): void {
    !this.aiming && this.reset();
  }

  public update (player: Vector3): void {
    if (!this.spawned) return;
    this.clone.rotation.y -= 0.025;

    const playerDistance = this.clone.position.distanceToSquared(player);
    const normalizedPower = Math.cos(this.spawnTime += 0.05) + 1.0;
    this.light.power = normalizedPower * this.halfLightPower;

    if (this.inStock < this.maxStock && playerDistance < 6.25) {
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
      targets: this.spine.position,
      duration: +!factor * 100.0,
      x: factor * 10.0 - 10.0,
      easing: 'linear'
    });
  }

  public append (factor: number): void {
    this.spine.position.copy(this.spinePosition);
    this.spine.rotation.copy(this.spineRotation);

    this.appended = true;
    this.updatePosition(factor);
  }

  private reset (): void {
    this.object.position.copy(this.position);
    this.object.rotation.copy(this.rotation);
    this.appended = false;
  }

  public override dispose (): void {
    this.light.dispose();
    this.clone.clear();
    super.dispose();
  }

  public set toggle (equip: boolean) {
    this.spine.visible = !equip;
    this.visible = equip;
  }

  public get dummy (): Assets.GLTF {
    return this.spine;
  }

  public get onStage (): boolean {
    return this.spawned;
  }
}
