import { AdditiveBlending, UnsignedInt248Type, NearestFilter, RGBFormat, DepthStencilFormat, GLSL3 } from 'three/src/constants';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import type { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { CameraObject, CameraListener } from '@/managers/GameCamera';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import type { RainParticles } from '@/managers/worker/types.d';

import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { DepthTexture } from 'three/src/textures/DepthTexture';

import type { Scene } from 'three/src/scenes/Scene';
import { Points } from 'three/src/objects/Points';
import { Vector2 } from 'three/src/math/Vector2';
import { Assets } from '@/managers/AssetsLoader';

import vertRain from '@/shaders/rain/main.vert';
import fragRain from '@/shaders/rain/main.frag';

import { Audio } from 'three/src/audio/Audio';
import Clouds from '@/environment/Clouds';
import Settings from '@/config/settings';
import Limbo from '@/environment/Limbo';

import Worker from '@/managers/worker';
import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';
import { Config } from '@/config';
import anime from 'animejs';

const DROP_RATIO = Math.tan(PI.d3) * 3;
const DROP_SIZE  = 5.0;

export default class Rain
{
  private readonly minCoords = Limbo.minCoords.map(coord => coord - 5);
  private readonly maxCoords = Limbo.maxCoords.map(coord => coord + 5);

  private readonly geometry = new BufferGeometry();
  private renderTargets?: Array<WebGLRenderTarget>;

  private readonly loader = new Assets.Loader();
  private readonly worker = new Worker();

  private height = window.innerHeight;
  private width = window.innerWidth;

  private material!: ShaderMaterial;
  private ambient!: Audio;
  private drops!: Points;
  private delta = 0.0;

  public constructor (private readonly renderer: WebGLRenderer, private readonly scene: Scene) {
    this.createRenderTargets();
    this.createWorkerLoop();
    this.createParticles();
    this.createAmbient();
  }

  private createRenderTargets (): void {
    if (!Settings.softParticles) return;

    const depthTexture = new DepthTexture(
      this.width, this.height, UnsignedInt248Type
    );

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

  private createWorkerLoop (): void {
    this.worker.add('Rain:particles', data =>
      this.updateParticleGeometry(data as RainParticles), {
        minCoords: this.minCoords,
        maxCoords: this.maxCoords,
        top: Clouds.height
      }
    );

    this.worker.get('Rain:particles', {
      camera: CameraObject.position,
      delta: this.delta
    });
  }

  private updateParticleGeometry (data: RainParticles): void {
    this.geometry.setAttribute('position', new Float32BufferAttribute(data[0], 3));
    this.geometry.setAttribute('alpha', new Float32BufferAttribute(data[1], 1));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;

    this.worker.get('Rain:particles', {
      camera: CameraObject.position,
      delta: this.delta
    });
  }

  private async createParticles (): Promise<void> {
    this.material = new ShaderMaterial({
      uniforms: {
        screenSize: { value: new Vector2(this.width, this.height) },
        color: { value: Color.getClass(Color.GRAY) },
        ratio: { value: this.height / DROP_RATIO },
        soft: { value: Settings.softParticles },

        near: { value: CameraObject.near },
        far: { value: CameraObject.far },
        dropSize: { value: DROP_SIZE },

        diffuse: { value: null },
        depth: { value: null }
      },

      blending: AdditiveBlending,
      fragmentShader: fragRain,
      vertexShader: vertRain,
      glslVersion: GLSL3,

      transparent: true,
      depthWrite: false
    });

    const uniforms = this.material.uniforms;
    this.drops = new Points(this.geometry, this.material);

    if (this.renderTargets) {
      uniforms.depth.value = this.renderTargets[0].depthTexture;
    }

    uniforms.diffuse.value = await Promise.all(
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
    this.ambient.setLoop(true);
    this.ambient.setVolume(0);

    setTimeout(() => anime({
      targets: { volume: this.ambient.getVolume() },
      update: ({ animations }) => this.ambient.setVolume(
        +animations[0].currentValue
      ),

      easing: 'linear',
      duration: 3000,
      volume: 0.25
    }), 7000);
  }

  public update (delta: number): void {
    this.delta = delta;

    if (this.renderTargets) {
      const lastRenderTarget = this.renderTargets[0];

      this.material.uniforms.depth.value = this.renderTargets[0].depthTexture;
      this.material.uniforms.near.value = CameraObject.near;
      this.material.uniforms.far.value = CameraObject.far;

      this.renderer.setRenderTarget(this.renderTargets[1]);
      this.renderer.render(this.scene, CameraObject);

      this.renderTargets[0] = this.renderTargets[1];
      this.renderTargets[1] = lastRenderTarget;

      this.renderer.setRenderTarget(null);
    }
  }

  public resize (): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.material.uniforms.ratio.value = this.height / DROP_RATIO;
    this.material.uniforms.screenSize.value.set(this.width, this.height);

    this.renderTargets?.forEach(renderTarget => {
      renderTarget.setSize(this.width, this.height);
      renderTarget.depthTexture.needsUpdate = true;
      renderTarget.texture.needsUpdate = true;
    });
  }

  public dispose (): void {
    this.renderTargets?.forEach(renderTarget => {
      renderTarget.depthTexture.dispose();
      renderTarget.texture.dispose();
      renderTarget.dispose();
    });

    this.scene.remove(this.drops);
    this.geometry.dispose();
    this.material.dispose();

    this.drops.clear();
    this.delta = 0.0;
  }

  public set pause (pause: boolean) {
    this.ambient[pause ? 'pause' : 'play']();
  }
}
