import { AdditiveBlending, UnsignedInt248Type, NearestFilter, RGBFormat, DepthStencilFormat, GLSL3 } from 'three/src/constants';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';

import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import type { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { updateRainParticles } from '@/managers/worker/rainParticles';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { DepthTexture } from 'three/src/textures/DepthTexture';
import type { RainParticles } from '@/managers/worker/types';

import { CameraObject } from '@/managers/GameCamera';
import type { Scene } from 'three/src/scenes/Scene';
import { Points } from 'three/src/objects/Points';

import LevelScene from '@/environment/LevelScene';
import { Vector2 } from 'three/src/math/Vector2';
import { Assets } from '@/loaders/AssetsLoader';

import vertRain from '@/shaders/rain/main.vert';
import fragRain from '@/shaders/rain/main.frag';

import type Worker from '@/managers/worker';
import Settings from '@/config/settings';

import type { Coords } from '@/types';
import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';
import { Config } from '@/config';

const DROP_RATIO = Math.tan(PI.d3) * 3;

export default class Rain
{
  private readonly minCoords = LevelScene.minCoords.map(coord => coord - 5);
  private readonly maxCoords = LevelScene.maxCoords.map(coord => coord + 5);

  private readonly geometry = new BufferGeometry();
  private renderTargets?: Array<WebGLRenderTarget>;

  private material!: ShaderMaterial;
  private worker?: Worker;
  private drops!: Points;
  private delta = 0.0;

  public constructor (private readonly renderer: WebGLRenderer, private readonly scene: Scene) {
    this.createRenderTargets();
    this.createParticles();

    if (Config.workerRain /* or running in main thread */) {
      this.createWorkerLoop();
    }
  }

  private createRenderTargets (): void {
    if (!Settings.softParticles) return;
    const { width, height } = this.renderer.domElement;

    const depthTexture = new DepthTexture(
      width, height, UnsignedInt248Type
    );

    this.renderTargets = [
      new WebGLRenderTarget(width, height),
      new WebGLRenderTarget(width, height)
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
    const { width, height } = this.renderer.domElement;

    this.material = new ShaderMaterial({
      uniforms: {
        screenSize: { value: new Vector2(width, height) },
        color: { value: Color.getClass(Color.GRAY) },
        soft: { value: Settings.softParticles },

        ratio: { value: height / DROP_RATIO },
        near: { value: CameraObject.near },
        far: { value: CameraObject.far },

        dropSize: { value: 3.0 },
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
      Config.Level.rain.map(
        Assets.Loader.loadTexture.bind(Assets.Loader)
      )
    );

    this.drops.frustumCulled = false;
    this.drops.renderOrder = 2.0;
    this.scene.add(this.drops);
  }

  private createWorkerLoop (): void {
    import('@/managers/worker').then(Worker => {
      this.worker = new Worker.default();

      this.worker.add('Rain:particles', data =>
        this.updateParticleGeometry(data as RainParticles), {
          minCoords: this.minCoords,
          maxCoords: this.maxCoords
        }
      );

      this.worker.post('Rain:particles', {
        camera: CameraObject.position,
        delta: this.delta
      });
    });
  }

  public update (delta: number): void {
    this.delta = delta;

    if (!Config.workerRain /* and not running in main thread */) {
      this.updateParticles();
    }

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

  private updateParticles (): void {
    this.updateParticleGeometry(
      updateRainParticles({
        minCoords: this.minCoords as unknown as Coords,
        maxCoords: this.maxCoords as unknown as Coords,
        camera: CameraObject.position,
        delta: this.delta
      })
    );
  }

  private updateParticleGeometry (data: RainParticles): void {
    this.geometry.setAttribute('position', new Float32BufferAttribute(data[0], 3));
    this.geometry.setAttribute('alpha', new Float32BufferAttribute(data[1], 1));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;

    this.worker?.post('Rain:particles', {
      camera: CameraObject.position,
      delta: this.delta
    });
  }

  public resize (width: number, height: number): void {
    this.material.uniforms.ratio.value = height / DROP_RATIO;
    this.material.uniforms.screenSize.value.set(width, height);

    this.renderTargets?.forEach(renderTarget => {
      renderTarget.depthTexture.needsUpdate = true;
      renderTarget.texture.needsUpdate = true;
      renderTarget.setSize(width, height);
    });
  }

  public dispose (): void {
    this.renderTargets?.forEach(renderTarget => {
      renderTarget.depthTexture.dispose();
      renderTarget.texture.dispose();
      renderTarget.dispose();
    });

    this.worker?.remove('Rain:particles');
    this.scene.remove(this.drops);
    this.geometry.dispose();

    this.material.dispose();
    this.drops.clear();
    this.delta = 0.0;
  }
}
