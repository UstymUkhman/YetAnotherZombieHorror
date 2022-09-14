import { OneMinusSrcAlphaFactor, CustomBlending, AddEquation, OneFactor, GLSL3 } from 'three/src/constants';
import { Float16BufferAttribute, Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import type { FireConfig, FireParticle, SmokeParticle } from '@/weapons/types';

import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { PI, DELTA_FRAME, randomInt } from '@/utils/Number';
import { PointLight } from 'three/src/lights/PointLight';

import { Points } from 'three/src/objects/Points';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/loaders/AssetsLoader';

import { Color } from '@/utils/Color';
import Spline from '@/utils/Spline';
import Settings from '@/settings';

const RATIO = Math.tan(PI.d6) * 2;
const FIRE = [0.0, 0.0, 0.0];

export default class Fire
{
  private smokeParticles: Array<SmokeParticle> = [];
  private fireParticles: Array<FireParticle> = [];

  private readonly smokeAlpha = new Spline();
  private readonly smokeSize = new Spline();
  private readonly fireAlpha = new Spline();

  private material!: ShaderMaterial;
  private light!: PointLight;

  private readonly geometry;
  private lightPower = 0.0;

  public constructor (private readonly config: FireConfig, weapon: Assets.GLTF, textures: string) {
    this.geometry = new BufferGeometry();

    this.createFireLight(weapon);
    this.createParticleGeometry();
    this.createParticles(weapon, textures);
  }

  private createFireLight (weapon: Assets.GLTF): void {
    const { intensity, position: { x, y } } = this.config;
    const decay = +Settings.getEnvironmentValue('physicalLights') + 1.0;

    this.light = new PointLight(Color.FIRE, intensity * (3.0 - decay), 1.0, decay);

    this.lightPower = this.light.power;
    this.light.position.set(x, y, 0.0);
    this.light.castShadow = true;

    this.light.power = 0.0;
    weapon.add(this.light);
  }

  private createParticleGeometry (): void {
    this.geometry.setAttribute('smokeAngle', new Float32BufferAttribute([], 1));
    this.geometry.setAttribute('smokeAlpha', new Float32BufferAttribute([], 1));
    this.geometry.setAttribute('smokeSize', new Float32BufferAttribute([], 1));

    this.geometry.setAttribute('fireAngle', new Float32BufferAttribute([], 1));
    this.geometry.setAttribute('fireSize', new Float32BufferAttribute([], 1));

    this.geometry.setAttribute('position', new Float32BufferAttribute([], 3));
    this.geometry.setAttribute('blend', new Float16BufferAttribute([], 1));

    this.fireAlpha.addPoint(0.0, 0.0);
    this.fireAlpha.addPoint(0.2, 1.0);
    this.fireAlpha.addPoint(0.5, 1.0);
    this.fireAlpha.addPoint(1.0, 0.0);

    this.smokeAlpha.addPoint(0.0, 0.0);
    this.smokeAlpha.addPoint(0.1, 0.1);
    this.smokeAlpha.addPoint(0.5, 0.1);
    this.smokeAlpha.addPoint(1.0, 0.0);

    this.smokeSize.addPoint(0.0, 0.0);
    this.smokeSize.addPoint(0.8, this.config.scale * 0.1);
    this.smokeSize.addPoint(1.0, this.config.scale * 0.12);
  }

  private async createParticles (weapon: Assets.GLTF, textures: string): Promise<void> {
    // Development imports:
    /* const vertFire = (await import('../shaders/shot/fire.vert')).default;
    const fragFire = (await import('../shaders/shot/fire.frag')).default; */

    const smoke = await Assets.Loader.loadTexture(`${textures}/smoke.png`);
    const fire = await Assets.Loader.loadTexture(`${textures}/fire.png`);

    // Production imports:
    const vertFire = await Assets.Loader.loadShader('shot/fire.vert');
    const fragFire = await Assets.Loader.loadShader('shot/fire.frag');

    this.material = new ShaderMaterial({
      blendDst: OneMinusSrcAlphaFactor,
      blendEquation: AddEquation,
      blending: CustomBlending,

      fragmentShader: fragFire,
      vertexShader: vertFire,

      blendSrc: OneFactor,
      glslVersion: GLSL3,

      vertexColors: true,
      transparent: true,
      depthWrite: false,
      depthTest: true,

      uniforms: {
        smoke: { value: smoke },
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
    this.addFireParticle();
    this.addSmokeParticles();
  }

  private addFireParticle (): void {
    const life = Math.random() * 0.1 + 0.1;

    const size = this.config.scale * (
      Math.random() * 0.1 + 0.15
    );

    this.fireParticles.push({
      rotation: Math.random() * PI.m2,
      currentSize: size,

      maxLife: life,
      life, size,

      blend: 0,
      alpha: 0
    });
  }

  private addSmokeParticles (): void {
    const [min, max] = this.config.particles;
    const particles = randomInt(min, max);

    for (let p = particles; p--;) {
      const velocity = this.config.velocity * (particles - p);
      const fadeOutDuration = Math.random() * 0.1 + 0.4;
      const life = this.config.scale * fadeOutDuration;

      this.smokeParticles.push({
        rotation: Math.random() * PI.m2,
        position: new Vector3(),
        currentSize: 0.0,

        life, velocity,
        maxLife: life,

        blend: 1,
        alpha: 0
      });
    }
  }

  public update (): boolean {
    this.updateParticles();

    const { length } = this.fireParticles;
    this.light.power = length * this.lightPower;

    length ? this.updateFireGeometry() : this.updateSmokeGeometry();
    return !!(length || this.smokeParticles.length);
  }

  private updateParticles (delta = DELTA_FRAME): void {
    for (let p = this.fireParticles.length; p--;) {
      const particle = this.fireParticles[p];
      if ((particle.life -= 0.05) <= 0.0) continue;

      const deltaLife = 1.0 - particle.life / particle.maxLife;
      const currentValue = this.fireAlpha.getValue(deltaLife);

      particle.currentSize = particle.size * currentValue;
      particle.alpha = currentValue;
      particle.rotation += 0.025;
    }

    this.fireParticles = this.fireParticles.filter(
      particle => particle.life > 0.0
    );

    for (let p = this.smokeParticles.length; p--;) {
      const particle = this.smokeParticles[p];
      if ((particle.life -= 0.01) <= 0.0) continue;
      const deltaLife = 1.0 - particle.life / particle.maxLife;

      particle.currentSize = this.smokeSize.getValue(deltaLife);
      particle.alpha = this.smokeAlpha.getValue(deltaLife);

      const rotation = (p % 2 * 2 - 1) * delta;
      const speed = particle.velocity * delta;

      particle.rotation += rotation;
      particle.position.y += speed;
      particle.velocity -= speed;
    }

    this.smokeParticles = this.smokeParticles.filter(
      particle => particle.life > 0.0
    );
  }

  private updateFireGeometry (): void {
    const rotation = [];
    const blend = [];
    const size = [];

    for (let p = this.fireParticles.length; p--;) {
      const particle = this.fireParticles[p];

      rotation.push(particle.rotation);
      size.push(particle.currentSize);
      blend.push(particle.blend);
    }

    this.geometry.setAttribute(
      'fireAngle', new Float32BufferAttribute(rotation, 1)
    );

    this.geometry.setAttribute(
      'fireSize', new Float32BufferAttribute(size, 1)
    );

    this.geometry.setAttribute(
      'position', new Float32BufferAttribute(FIRE, 3)
    );

    this.geometry.setAttribute(
      'blend', new Float16BufferAttribute(blend, 1)
    );

    this.geometry.attributes.fireAngle.needsUpdate = true;
    this.geometry.attributes.fireSize.needsUpdate = true;

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.blend.needsUpdate = true;
  }

  private updateSmokeGeometry (): void {
    const position = [];
    const rotation = [];
    const opacity = [];
    const blend = [];
    const size = [];

    for (let p = this.smokeParticles.length; p--;) {
      const particle = this.smokeParticles[p];
      const { x, y, z } = particle.position;

      rotation.push(particle.rotation);
      size.push(particle.currentSize);
      opacity.push(particle.alpha);
      blend.push(particle.blend);
      position.push(x, y, z);
    }

    this.geometry.setAttribute(
      'smokeAngle', new Float32BufferAttribute(rotation, 1)
    );

    this.geometry.setAttribute(
      'smokeAlpha', new Float32BufferAttribute(opacity, 1)
    );

    this.geometry.setAttribute(
      'smokeSize', new Float32BufferAttribute(size, 1)
    );

    this.geometry.setAttribute(
      'position', new Float32BufferAttribute(position, 3)
    );

    this.geometry.setAttribute(
      'blend', new Float16BufferAttribute(blend, 1)
    );

    this.geometry.attributes.smokeAngle.needsUpdate = true;
    this.geometry.attributes.smokeAlpha.needsUpdate = true;
    this.geometry.attributes.smokeSize.needsUpdate = true;

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.blend.needsUpdate = true;
  }

  public resize (height: number): void {
    this.material.uniforms.ratio.value = height / RATIO;
  }

  public dispose (): void {
    this.material.uniforms.smoke.value.dispose();
    this.material.uniforms.fire.value.dispose();

    this.smokeParticles.splice(0);
    this.fireParticles.splice(0);

    this.smokeAlpha.dispose();
    this.smokeSize.dispose();
    this.fireAlpha.dispose();

    this.geometry.dispose();
    this.material.dispose();
    this.light.dispose();
  }
}
