import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import type { FireConfig, FireParticle } from '@/weapons/types';

import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { AdditiveBlending, GLSL3 } from 'three/src/constants';

import { Points } from 'three/src/objects/Points';
import { Assets } from '@/loaders/AssetsLoader';

import Spline from '@/utils/Spline';
import { PI } from '@/utils/Number';

const RATIO = Math.tan(PI.d6) * 2;

export default class Fire
{
  private readonly geometry = new BufferGeometry();
  private particles: Array<FireParticle> = [];
  private readonly spline = new Spline();
  private material!: ShaderMaterial;

  public constructor (private readonly config: FireConfig, weapon: Assets.GLTF, textures: string) {
    this.createParticleGeometry();
    this.createParticles(weapon, textures);
  }

  private createParticleGeometry (): void {
    this.geometry.setAttribute('position', new Float32BufferAttribute([], 3));
    this.geometry.setAttribute('angle', new Float32BufferAttribute([], 1));
    this.geometry.setAttribute('size', new Float32BufferAttribute([], 1));

    this.spline.addPoint(0.0, 0.0);
    this.spline.addPoint(0.2, 1.0);
    this.spline.addPoint(0.5, 1.0);
    this.spline.addPoint(1.0, 0.0);
  }

  private async createParticles (weapon: Assets.GLTF, textures: string): Promise<void> {
    const fire = await Assets.Loader.loadTexture(`${textures}/fire.png`);

    // Development imports:
    /* const vertFire = await (await import('../shaders/shot/fire.vert')).default;
    const fragFire = await (await import('../shaders/shot/fire.frag')).default; */

    // Production imports:
    const vertFire = await Assets.Loader.loadShader('shot/fire.vert');
    const fragFire = await Assets.Loader.loadShader('shot/fire.frag');

    this.material = new ShaderMaterial({
      blending: AdditiveBlending,
      fragmentShader: fragFire,
      vertexShader: vertFire,

      glslVersion: GLSL3,
      transparent: true,

      uniforms: {
        ratio: { value: null },
        fire: { value: fire }
      }
    });

    const particles = new Points(this.geometry, this.material);

    particles.position.x = this.config.position.x;
    particles.position.y = this.config.position.y;

    particles.renderOrder = 2.0;
    weapon.add(particles);
  }

  public addParticles (): void {
    const life = Math.random() * 0.1 + 0.1;

    const size = this.config.scale * (
      Math.random() * 0.1 + 0.15
    );

    this.particles.push({
      rotation: Math.random() * PI.m2,
      currentSize: size,
      maxLife: life,
      life: life,
      alpha: 0,
      size
    });

    this.geometry.setAttribute('position',
      new Float32BufferAttribute([0.0, 0.0, 0.0], 3)
    );

    this.geometry.attributes.position.needsUpdate = true;
  }

  public update (): void {
    if (this.particles.length) {
      this.updateParticles();
      this.updateGeometry();
    }
  }

  private updateParticles (): void {
    for (let p = this.particles.length; p--;) {
      const particle = this.particles[p];
      if ((particle.life -= 0.05) <= 0.0) continue;

      const deltaLife = 1.0 - particle.life / particle.maxLife;
      const currentValue = this.spline.getValue(deltaLife);

      particle.currentSize = particle.size * currentValue;
      particle.alpha = currentValue;
      particle.rotation += 0.025;
    }

    this.particles = this.particles.filter(
      particle => particle.life > 0.0
    );
  }

  private updateGeometry (): void {
    const angles = [];
    const sizes = [];

    for (let p = this.particles.length; p--;) {
      const particle = this.particles[p];
      sizes.push(particle.currentSize);
      angles.push(particle.rotation);
    }

    this.geometry.setAttribute(
      'angle', new Float32BufferAttribute(angles, 1)
    );

    this.geometry.setAttribute(
      'size', new Float32BufferAttribute(sizes, 1)
    );

    this.geometry.attributes.angle.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  public resize (height: number): void {
    this.material.uniforms.ratio.value = height / RATIO;
  }

  public dispose (): void {
    this.particles.splice(0);
    this.geometry.dispose();
    this.material.dispose();
    this.spline.dispose();
  }
}
