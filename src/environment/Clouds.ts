import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';

import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { InstancedMesh } from 'three/src/objects/InstancedMesh';

import { PointLight } from 'three/src/lights/PointLight';
import { NormalBlending } from 'three/src/constants';
import { Object3D } from 'three/src/core/Object3D';
import { Vector3 } from 'three/src/math/Vector3';

import { Matrix4 } from 'three/src/math/Matrix4';
import { PI, randomInt } from '@/utils/Number';
import { Mesh } from 'three/src/objects/Mesh';
import { Euler } from 'three/src/math/Euler';

import { Vector } from '@/utils/Vector';
import Limbo from '@/environment/Limbo';
import { Color } from '@/utils/Color';


export default class Clouds
{
  private readonly _showLighting = this.showLighting.bind(this);
  private readonly _hideLighting = this.hideLighting.bind(this);

  private readonly radius = Math.max(Limbo.size.x, Limbo.size.y);
  private readonly rotation = new Euler(PI.d2, 0, 0);

  private readonly loader = new TextureLoader();
  private readonly cloudMatrix = new Matrix4();

  private clouds!: InstancedMesh;
  private lighting!: PointLight;

  public constructor (private readonly count: number) {
    this.createLighting();
    this.createClouds();
  }

  private createLighting (): void {
    this.lighting = new PointLight(Color.BLUE, 10, this.radius, 2.5);
    this.lighting.position.set(0.0, this.radius, 0.0);

    this.lighting.castShadow = true;
    this.lighting.power = 0.0;
    this.startLighting();
  }

  private startLighting (): void {
    setTimeout(this._showLighting, 1e3 * (
      Math.random() * 20 + 10
    ));
  }

  private showLighting (): void {
    this.clouds.getMatrixAt(randomInt(0, this.count - 1), this.cloudMatrix);
    this.lighting.position.setFromMatrixPosition(this.cloudMatrix);

    setTimeout(this._hideLighting, Math.random() * 400 + 100);
    this.lighting.power = 100 + Math.random() * 150;

    this.lighting.position.y -= Math.random() * (
      this.lighting.position.y / 4.0
    );
  }

  private hideLighting (): void {
    this.lighting.power = 0.0;
    this.startLighting();
  }

  private createClouds (): void {
    const cloudsGeometry = new SphereGeometry(this.radius, 16, 16, 0, Math.PI);
    const smoke = this.loader.load('./assets/images/smoke.png');

    cloudsGeometry.parameters.phiLength = Math.PI;
    cloudsGeometry.rotateX(-PI.d2);

    const position = new Vector3();
    const cloud = new Object3D();

    this.clouds = new InstancedMesh(
      new PlaneGeometry(this.radius, this.radius),
      new MeshLambertMaterial({
        blending: NormalBlending,
        vertexColors: false,
        transparent: true,
        depthWrite: false,
        opacity: 0.25,
        fog: false,
        map: smoke
      }),

      this.count
    );

    const sampler = new MeshSurfaceSampler(
      new Mesh(cloudsGeometry.toNonIndexed())
    ).build();

    for (let i = 0; i < this.count; i++) {
      sampler.sample(position);
      cloud.position.copy(position);

      cloud.lookAt(Vector.DOWN);
      cloud.updateMatrix();

      this.clouds.setMatrixAt(i, cloud.matrix);
    }

    this.clouds.instanceMatrix.needsUpdate = true;
    this.clouds.position.copy(Limbo.center);
  }

  public update (): void {
    for (let c = 0; c < this.count; c++) {
      const direction = c % 2 * 2 - 1;

      this.clouds.getMatrixAt(c, this.cloudMatrix);
      const cloudMatrix = this.cloudMatrix.clone();

      this.rotation.setFromRotationMatrix(cloudMatrix);
      this.rotation.z += Math.random() * direction * 0.001;
      this.cloudMatrix.makeRotationFromEuler(this.rotation);

      this.cloudMatrix.copyPosition(cloudMatrix);
      this.clouds.setMatrixAt(c, this.cloudMatrix);
    }

    this.clouds.instanceMatrix.needsUpdate = true;
  }

  public dispose (): void {
    this.lighting.remove();
    this.clouds.dispose();
  }

  public get sky (): InstancedMesh {
    return this.clouds;
  }

  public get flash (): PointLight {
    return this.lighting;
  }
}
