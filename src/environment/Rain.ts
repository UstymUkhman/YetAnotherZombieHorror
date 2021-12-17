import { AdditiveBlending, UnsignedInt248Type, NearestFilter, RGBFormat, DepthStencilFormat, GLSL3 } from 'three/src/constants';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import type { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import type { LevelCoords, RainParticles } from '@/environment/types';

import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { updateRainParticles } from '@/worker/updateRainParticles';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { DepthTexture } from 'three/src/textures/DepthTexture';

import type { Scene } from 'three/src/scenes/Scene';
import { Points } from 'three/src/objects/Points';
import LevelScene from '@/environment/LevelScene';

import { CameraObject } from '@/managers/Camera';
import { Vector2 } from 'three/src/math/Vector2';
import { Assets } from '@/loaders/AssetsLoader';
import type WebWorker from '@/worker/WebWorker';

import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';

import Settings from '@/settings';
import Configs from '@/configs';

const DROP_RATIO = Math.tan(PI.d3) * 3;

export default class Rain
{
  private readonly minCoords = LevelScene.minCoords.map(coord => coord - 5);
  private readonly maxCoords = LevelScene.maxCoords.map(coord => coord + 5);

  private readonly geometry = new BufferGeometry();
  private renderTargets?: Array<WebGLRenderTarget>;

  private material!: ShaderMaterial;
  private drops!: Points;
  private delta = 0.0;

  public constructor (
    private readonly renderer: WebGLRenderer,
    private readonly scene: Scene,
    private readonly worker?: WebWorker
  ) {
    this.createRenderTargets();
    this.createWorkerLoop();
    this.createParticles();
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

    // Development imports:
    /* const vertRain = await (await import('../shaders/rain/main.vert')).default;
    const fragRain = await (await import('../shaders/rain/main.frag')).default; */

    // Production imports:
    const vertRain = await Assets.Loader.loadShader('rain/main.vert');
    const fragRain = await Assets.Loader.loadShader('rain/main.frag');

    this.material = new ShaderMaterial({
      uniforms: {
        screenSize: { value: new Vector2(width, height) },
        color: { value: Color.getClass(Color.RAIN) },
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

    Promise.all(Configs.Level.rain.map(
      Assets.Loader.loadTexture.bind(Assets.Loader)
    )).then(textures => uniforms.diffuse.value = textures);

    this.drops.frustumCulled = false;
    this.drops.renderOrder = 2.0;
    this.scene.add(this.drops);
  }

  private createWorkerLoop (): void {
    this.worker?.add('Rain::UpdateParticles', event =>
      this.updateParticleGeometry(event.data as RainParticles), {
        minCoords: this.minCoords,
        maxCoords: this.maxCoords
      }
    );

    this.worker?.post('Rain::UpdateParticles', {
      camera: CameraObject.position,
      delta: this.delta
    });
  }

  public update (delta: number): void {
    this.delta = delta;
    !this.worker && this.updateParticles();

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
    const minCoords = this.minCoords as unknown as LevelCoords;
    const maxCoords = this.maxCoords as unknown as LevelCoords;

    this.updateParticleGeometry(
      updateRainParticles({
        camera: CameraObject.position,
        minCoords: minCoords,
        maxCoords: maxCoords,
        delta: this.delta
      })
    );
  }

  private updateParticleGeometry (data: RainParticles): void {
    this.geometry.setAttribute('position', new Float32BufferAttribute(data[0], 3));
    this.geometry.setAttribute('angle', new Float32BufferAttribute(data[1], 1));
    this.geometry.setAttribute('alpha', new Float32BufferAttribute(data[2], 1));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.angle.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;

    this.worker?.post('Rain::UpdateParticles', {
      camera: CameraObject.position,
      delta: this.delta
    });
  }

  public resize (width: number, height: number): void {
    if (this.material) {
      this.material.uniforms.ratio.value = height / DROP_RATIO;
      this.material.uniforms.screenSize.value.set(width, height);
    }

    this.renderTargets?.forEach(renderTarget => {
      renderTarget.depthTexture.needsUpdate = true;
      renderTarget.texture.needsUpdate = true;
      renderTarget.setSize(width, height);
    });
  }

  public dispose (): void {
    this.worker?.remove('Rain::UpdateParticles');

    this.renderTargets?.forEach(renderTarget => {
      renderTarget.depthTexture.dispose();
      renderTarget.texture.dispose();
      renderTarget.dispose();
    });

    this.scene.remove(this.drops);
    this.material?.dispose();
    this.geometry.dispose();

    this.drops?.clear();
    this.delta = 0.0;
  }
}
