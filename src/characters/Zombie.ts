import type { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import type { Assets } from '@/loaders/AssetsLoader';
import type { Mesh } from 'three/src/objects/Mesh';

import { LoopOnce } from 'three/src/constants';
import Character from '@/characters/Character';
import Configs from '@/configs';
import anime from 'animejs';

export default class Zombie extends Character
{
  public constructor () {
    super({
      ...Configs.Enemy,
      model: `${Configs.basePath(true)}${Configs.Enemy.model}`
    });
  }

  public override async load (): Promise<Assets.GLTFModel> {
    const character = await super.load();
    this.setDefaultState();
    return character;
  }

  public override update (delta: number): void {
    super.update(delta);
  }

  public fade (visible: boolean): void {
    anime({
      targets: this.skinnedMesh.material,
      duration: +visible * 150 + 100,
      opacity: +visible,
      easing: 'linear'
    });
  }

  private setDefaultState (): void {
    this.animations.scream.clampWhenFinished = true;
    this.animations.scream.setLoop(LoopOnce, 0);
    this.mesh.position.set(0.0, -0.81, 0.0);
    this.mesh.rotation.set(0.0, 2.85, 0.0);

    this.setAnimation('Idle');
    this.setMixerTimeScale(0.5);
    this.animations.idle.play();

    this.mesh.traverse(child => {
      const childMesh = child as Mesh;

      if (childMesh.isMesh) {
        (childMesh.material as MeshStandardMaterial).opacity = 0.0;
        childMesh.castShadow = false;
      }
    });

    this.reset();
  }

  public scream () {
    this.setMixerTimeScale(1.0);
    this.animations.scream.play();

    setTimeout(this.animations.idle.stop.bind(this.animations.idle), 250);
    this.animations.idle.crossFadeTo(this.animations.scream, 0.250, true);

    setTimeout(() => {
      this.fade(false);
      this.animations.idle.play();
      this.setMixerTimeScale(0.5);

      this.animations.scream.crossFadeTo(this.animations.idle, 0.1, true);
      setTimeout(this.animations.scream.stop.bind(this.animations.scream), 100);
    }, this.getAnimationDuration('scream') * 1e3 - 100);
  }

  private get skinnedMesh (): SkinnedMesh {
    return this.mesh.children[0].children[1] as SkinnedMesh;
  }

  public set freeze (frozen: boolean) {
    this.setMixerTimeScale(+!frozen * 0.5);
  }
}
