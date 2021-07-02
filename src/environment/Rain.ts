import { AdditiveBlending, UnsignedInt248Type, NearestFilter, RGBFormat, DepthStencilFormat, GLSL3 } from 'three/src/constants';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import type { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { CameraObject, CameraListener } from '@/managers/GameCamera';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { DepthTexture } from 'three/src/textures/DepthTexture';
import type { Color as TColor } from 'three/src/math/Color';
import type { Scene } from 'three/src/scenes/Scene';
import { Points } from 'three/src/objects/Points';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/managers/AssetsLoader';

import vertRain from '@/shaders/rain/main.vert';
import fragRain from '@/shaders/rain/main.frag';

import { Audio } from 'three/src/audio/Audio';
import Clouds from '@/environment/Clouds';
import Settings from '@/config/settings';
import Limbo from '@/environment/Limbo';

import { Color } from '@/utils/Color';
import Spline from '@/utils/Spline';
import { Config } from '@/config';

type ParticleSettings = {
  position: Vector3,
  velocity: Vector3,
  maxLife: number,

  alpha: number,
  color: TColor,
  size: number,
  life: number
};

export default class Rain
{
  private readonly geometry = new BufferGeometry();
  private renderTargets!: Array<WebGLRenderTarget>;
  private particles: Array<ParticleSettings> = [];

  private readonly loader = new Assets.Loader();
  private readonly alphaSpline = new Spline();
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

  private async createParticles (vertexColors = false): Promise<void> {
    this.material = new ShaderMaterial({
      uniforms: {
        size: { value: new Vector2(this.width, this.height) },
        depth: { value: this.renderTargets[0].depthTexture },

        near: { value: this.camera.near },
        far: { value: this.camera.far },
        diffuse: { value: null }
      },

      vertexShader: !vertexColors ? vertRain :
        `#define USE_VERTEX_COLORS\n\n${vertRain}`,

      blending: AdditiveBlending,
      fragmentShader: fragRain,
      glslVersion: GLSL3,

      transparent: true,
      depthWrite: false,
      vertexColors
    });

    this.geometry.setAttribute('position', new Float32BufferAttribute([], 3));
    this.geometry.setAttribute('color', new Float32BufferAttribute([], 4));

    this.alphaSpline.addPoint(0.0, 0.0);
    this.alphaSpline.addPoint(0.1, 0.9);
    this.alphaSpline.addPoint(0.9, 0.9);
    this.alphaSpline.addPoint(1.0, 0.0);

    this.addParticles();
    this.updateGeometry();

    this.drops = new Points(this.geometry, this.material);
    const drop = await this.loader.loadTexture(Config.Limbo.rain[0]);

    this.drops.position.set(Limbo.center.x, Clouds.height, Limbo.center.z);
    // this.drops.scale.set(Clouds.height, 1.0, Clouds.height);
    this.material.uniforms.diffuse.value = drop;

    this.drops.renderOrder = 2.0;
    this.scene.add(this.drops);
  }

  private async createAmbient (): Promise<void> {
    const ambient = await this.loader.loadAudio(Config.Limbo.ambient);
    this.ambient = new Audio(CameraListener);

    this.ambient.setBuffer(ambient);
    this.ambient.setVolume(0.5);
    this.ambient.setLoop(true);
  }

  private addParticles (): void {
    const time = Math.floor(this.timeElapsed * 100.0);
    this.timeElapsed -= time / 100.0;

    for (let i = 0; i < time; i++) {
      this.particles.push({
        velocity: new Vector3(0.0, -10.0, 0.0),
        color: Color.getClass(Color.WHITE),

        position: new Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ),

        maxLife: 50.0,
        life: 50.0,
        alpha: 0,
        size: 1
      });
    }
  }

  private updateParticles (delta: number): void {
    for (let p = 0; p < this.particles.length; p++) {
      const particle = this.particles[p];
      particle.life -= delta;

      if (particle.life <= 0.0) continue;

      const deltaLife = 1.0 - particle.life / particle.maxLife;
      const drag = particle.velocity.clone();
      const { x, y, z } = drag;

      particle.alpha = this.alphaSpline.getValue(deltaLife);
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
    const colors = [];

    for (let p = 0, l = this.particles.length; p < l; p++) {
      const particle = this.particles[p];

      positions.push(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );

      colors.push(
        particle.color.r,
        particle.color.g,
        particle.color.b,
        particle.alpha
      );
    }

    this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
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

    this.alphaSpline.dispose();
    this.particles.splice(0);
    this.geometry.dispose();

    this.material.dispose();
    this.timeElapsed = 0.0;
    this.drops.clear();
  }

  public set pause (pause: boolean) {
    this.ambient[pause ? 'pause' : 'play']();
  }
}
