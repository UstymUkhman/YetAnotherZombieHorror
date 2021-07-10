import { AdditiveBlending, UnsignedInt248Type, NearestFilter, RGBFormat, DepthStencilFormat, GLSL3 } from 'three/src/constants';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import type { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { CameraObject, CameraListener } from '@/managers/GameCamera';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { DepthTexture } from 'three/src/textures/DepthTexture';

import type { Scene } from 'three/src/scenes/Scene';
import { Points } from 'three/src/objects/Points';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/managers/AssetsLoader';

import vertRain from '@/shaders/rain/main.vert';
import fragRain from '@/shaders/rain/main.frag';

import { Audio } from 'three/src/audio/Audio';
import { PI, random } from '@/utils/Number';
import Clouds from '@/environment/Clouds';

import Settings from '@/config/settings';
import Limbo from '@/environment/Limbo';
import { Color } from '@/utils/Color';
import { Config } from '@/config';

const RATIO = Math.tan(PI.d3) * 3;

type ParticleSettings = {
  position: Vector3,
  velocity: Vector3,

  maxLife: number,
  alpha: number,
  life: number
};

export default class Rain
{
  private readonly minCoords = Limbo.minCoords.map(coord => coord - 5);
  private readonly maxCoords = Limbo.maxCoords.map(coord => coord + 5);

  private readonly geometry = new BufferGeometry();
  private renderTargets!: Array<WebGLRenderTarget>;
  private particles: Array<ParticleSettings> = [];

  private readonly loader = new Assets.Loader();
  // private readonly alphaSpline = new Spline();

  private readonly skyTop = Clouds.height;
  private readonly camera = CameraObject;

  private height = window.innerHeight;
  private width = window.innerWidth;

  private material!: ShaderMaterial;
  private timeElapsed = 0.0;

  private ambient!: Audio;
  private drops!: Points;

  public constructor (private readonly renderer: WebGLRenderer, private readonly scene: Scene) {
    this.createRenderTargets();
    this.createParticles();
    this.createAmbient();
  }

  private createRenderTargets (): void {
    const depthTexture = new DepthTexture(this.width, this.height, UnsignedInt248Type);

    this.renderTargets = [
      new WebGLRenderTarget(this.width, this.height),
      new WebGLRenderTarget(this.width, this.height)
    ];

    depthTexture.format = DepthStencilFormat;
    depthTexture.minFilter = NearestFilter;
    depthTexture.magFilter = NearestFilter;

    this.renderTargets.forEach(renderTarget => {
      renderTarget.depthTexture = depthTexture.clone();

      renderTarget.texture.minFilter = NearestFilter;
      renderTarget.texture.magFilter = NearestFilter;
      renderTarget.texture.generateMipmaps = false;

      renderTarget.texture.format = RGBFormat;
      renderTarget.stencilBuffer = true;
      renderTarget.depthBuffer = true;
    });
  }

  private async createParticles (): Promise<void> {
    this.material = new ShaderMaterial({
      uniforms: {
        size: { value: new Vector2(this.width, this.height) },
        depth: { value: this.renderTargets[0].depthTexture },
        color: { value: Color.getClass(Color.GRAY) },
        ratio: { value: this.height / RATIO },

        near: { value: this.camera.near },
        far: { value: this.camera.far },
        diffuse: { value: null }
      },

      blending: AdditiveBlending,
      fragmentShader: fragRain,
      vertexShader: vertRain,
      glslVersion: GLSL3,

      transparent: true,
      depthWrite: false
    });

    this.geometry.setAttribute('position', new Float32BufferAttribute([], 3));
    this.geometry.setAttribute('alpha', new Float32BufferAttribute([], 1));

    // this.alphaSpline.addPoint(0.0, 0.0);
    // this.alphaSpline.addPoint(0.2, 1.0);
    // this.alphaSpline.addPoint(0.9, 1.0);
    // this.alphaSpline.addPoint(1.0, 0.0);

    this.addParticles();
    this.updateGeometry();

    this.drops = new Points(this.geometry, this.material);

    this.material.uniforms.diffuse.value = await Promise.all(
      Config.Limbo.rain.map(this.loader.loadTexture.bind(this.loader))
    );

    this.drops.frustumCulled = false;
    this.drops.renderOrder = 2.0;
    this.scene.add(this.drops);
  }

  private async createAmbient (): Promise<void> {
    const ambient = await this.loader.loadAudio(Config.Limbo.ambient);
    this.ambient = new Audio(CameraListener);

    this.ambient.setBuffer(ambient);
    this.ambient.setVolume(0.25);
    this.ambient.setLoop(true);
  }

  private addParticles (): void {
    const time = Math.floor(this.timeElapsed * 100.0);
    this.timeElapsed -= time / 100.0;
    const particles = time * 50.0; // 25.0 | 22.125; | 20.0;

    for (let i = 0; i < particles; i++) {
      const offset = Math.random();
      const life = 5.25 - offset * 1.5;
      const velocity = Math.random() * 25 + 25;

      this.particles.push({
        velocity: new Vector3(0.0, -velocity, 0.0),

        position: new Vector3(
          random(this.minCoords[0], this.maxCoords[0]),
          this.skyTop - offset * 50,
          random(this.minCoords[1], this.maxCoords[1])
        ),

        maxLife: life,
        alpha: 1, // 0
        life
      });
    }
  }

  private updateParticles (delta: number): void {
    for (let p = 0; p < this.particles.length; p++) {
      const particle = this.particles[p];
      particle.life -= delta;

      if (particle.life <= 0.0) continue;

      // const deltaLife = 1.0 - particle.life / particle.maxLife;
      const drag = particle.velocity.clone();
      const { x, y, z } = drag;

      // particle.alpha = this.alphaSpline.getValue(deltaLife);
      particle.position.add(drag.multiplyScalar(delta));

      drag.multiplyScalar(0.1).set(
        Math.sign(x) * Math.min(Math.abs(drag.x), Math.abs(x)),
        Math.sign(y) * Math.min(Math.abs(drag.y), Math.abs(y)),
        Math.sign(z) * Math.min(Math.abs(drag.z), Math.abs(z))
      );

      particle.velocity.sub(drag);
    }

    this.particles = this.particles.filter(
      particle => particle.life > 0.0
    )
      .sort((a: ParticleSettings, b: ParticleSettings) => {
        const aDistance = this.camera.position.distanceToSquared(a.position);
        const bDistance = this.camera.position.distanceToSquared(b.position);

        return aDistance > bDistance ? -1 : aDistance < bDistance ? 1 : 0;
      }
    );
  }

  private updateGeometry (): void {
    const positions = [];
    const alphas = [];

    for (let p = 0, l = this.particles.length; p < l; p++) {
      const particle = this.particles[p];
      alphas.push(particle.alpha);

      positions.push(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );
    }

    this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('alpha', new Float32BufferAttribute(alphas, 1));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
  }

  public update (delta: number): void {
    const lastRenderTarget = this.renderTargets[0];
    this.timeElapsed += delta;

    this.addParticles();
    this.updateParticles(delta);
    this.updateGeometry();

    if (Settings.softParticles) {
      this.material.uniforms.depth.value = this.renderTargets[0].depthTexture;
      this.material.uniforms.near.value = this.camera.near;
      this.material.uniforms.far.value = this.camera.far;

      this.renderer.setRenderTarget(this.renderTargets[1]);
      this.renderer.render(this.scene, this.camera);

      this.renderTargets[0] = this.renderTargets[1];
      this.renderTargets[1] = lastRenderTarget;

      this.renderer.setRenderTarget(null);
    }
  }

  public resize (): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.material.uniforms.ratio.value = this.height / RATIO;
    this.material.uniforms.size.value.set(this.width, this.height);

    this.renderTargets.forEach(renderTarget => {
      renderTarget.setSize(this.width, this.height);
      renderTarget.depthTexture.needsUpdate = true;
      renderTarget.texture.needsUpdate = true;
    });
  }

  public dispose (): void {
    this.renderTargets.forEach(renderTarget => {
      renderTarget.depthTexture.dispose();
      renderTarget.texture.dispose();
      renderTarget.dispose();
    });

    // this.alphaSpline.dispose();
    this.particles.splice(0);
    this.geometry.dispose();

    this.material.dispose();
    this.timeElapsed = 0;
    this.drops.clear();
  }

  public set pause (pause: boolean) {
    this.ambient[pause ? 'pause' : 'play']();
  }
}
