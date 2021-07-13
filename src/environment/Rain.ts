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

import GameLevel from '@/environment/GameLevel';
import { Audio } from 'three/src/audio/Audio';
import Clouds from '@/environment/Clouds';
import Settings from '@/config/settings';
import Viewport from '@/utils/Viewport';

import Worker from '@/managers/worker';
import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';
import Raindrop from 'raindrop-fx';
import { Config } from '@/config';
import anime from 'animejs';

const DROP_RATIO = Math.tan(PI.d3) * 3;

export default class Rain
{
  private readonly minCoords = GameLevel.minCoords.map(coord => coord - 5);
  private readonly maxCoords = GameLevel.maxCoords.map(coord => coord + 5);

  private readonly geometry = new BufferGeometry();
  private renderTargets?: Array<WebGLRenderTarget>;

  private readonly loader = new Assets.Loader();
  private readonly worker = new Worker();

  private canvas?: HTMLCanvasElement;
  private material!: ShaderMaterial;
  private raindrops?: Raindrop;

  private ambient!: Audio;
  private drops!: Points;
  private delta = 0.0;

  public constructor (private readonly renderer: WebGLRenderer, private readonly scene: Scene) {
    this.createRenderTargets();
    this.createWorkerLoop();
    this.createParticles();
    this.createRaindrop();
    this.createAmbient();
  }

  private createRenderTargets (): void {
    if (!Settings.softParticles) return;
    const { width, height } = Viewport.size;

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
    const { width, height } = Viewport.size;

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

    this.drops.frustumCulled = false;
    this.drops.renderOrder = 2.0;
    this.scene.add(this.drops);

    if (this.renderTargets) {
      uniforms.depth.value = this.renderTargets[0].depthTexture;
    }

    uniforms.diffuse.value = await Promise.all(
      Config.Level.rain.map(this.loader.loadTexture.bind(this.loader))
    );
  }

  private createRaindrop (): void {
    if (!Settings.raindrops) return;

    this.canvas = document.createElement('canvas');
    this.canvas.height = Viewport.size.height;
    this.canvas.width = Viewport.size.width;

    this.raindrops = new Raindrop({
      background: this.renderer.domElement,
      motionInterval: [0.25, 0.5],
      spawnInterval: [0.1, 0.5],
      spawnSize: [75.0, 100.0],

      backgroundBlurSteps: 0,
      dropletsPerSeconds: 15,
      raindropLightBump: 0.5,
      velocitySpread: 0.25,
      canvas: this.canvas,

      refractBase: 0.5,
      mistBlurStep: 0,
      spawnLimit: 50,
      evaporate: 25,
      mist: false
    });

    // Dirty hack to bypass the need of mandatory background blur:
    // https://github.com/SardineFish/raindrop-fx/pull/3#issuecomment-877057762

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raindropsRenderer = this.raindrops.renderer as any;
    raindropsRenderer.blurryBackground = raindropsRenderer.background;

    this.raindrops.start();
  }

  private async createAmbient (): Promise<void> {
    const ambient = await this.loader.loadAudio(Config.Level.ambient);
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
      duration: 2500,
      volume: 0.25
    }), 7500);
  }

  public update (delta: number): void {
    this.delta = delta;
    this.raindrops?.setBackground(this.renderer.domElement);

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

  public resize (width: number, height: number): void {
    this.raindrops?.resize(width, height);
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

    this.worker.remove('Rain:particles');
    this.scene.remove(this.drops);
    this.geometry.dispose();
    this.material.dispose();
    this.raindrops?.stop();

    this.drops.clear();
    this.delta = 0.0;
  }

  public set pause (pause: boolean) {
    this.ambient && this.ambient[pause ? 'pause' : 'play']();
  }

  public get cameraDrops (): HTMLCanvasElement | undefined {
    return this.canvas;
  }
}
