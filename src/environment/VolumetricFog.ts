import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';

import { FogExp2 } from 'three/src/scenes/FogExp2';
import fogParsFrag from '@/shaders/fog.pars.frag';
import fogParsVert from '@/shaders/fog.pars.vert';
import { Vector3 } from 'three/src/math/Vector3';

import { DoubleSide } from 'three/src/constants';
import { Sphere } from 'three/src/math/Sphere';
import { Mesh } from 'three/src/objects/Mesh';

import fogFrag from '@/shaders/fog.frag';
import fogVert from '@/shaders/fog.vert';

import Limbo from '@/environment/Limbo';
import { Color } from '@/utils/Color';
import { Config } from '@/config';

export default class VolumetricFog extends FogExp2
{
  private readonly minPoint = new Vector3(
    Limbo.minCoords[0], Config.Limbo.height, Limbo.minCoords[1]
  );

  private readonly maxPoint = new Vector3(
    Limbo.maxCoords[0], Config.Limbo.height, Limbo.maxCoords[1]
  );

  private readonly sphere = this.createSkybox();
  public override readonly name = 'Volumetric';

  public constructor () {
    super(Color.GREY, 0.1);

    ShaderChunk.fog_pars_fragment = fogParsFrag;
    ShaderChunk.fog_pars_vertex   = fogParsVert;
    ShaderChunk.fog_fragment      = fogFrag;
    ShaderChunk.fog_vertex        = fogVert;
  }

  private createSkybox (): Mesh {
    const sphere = new Sphere();

    sphere.expandByPoint(this.minPoint.multiplyScalar(1.5));
    sphere.expandByPoint(this.maxPoint.multiplyScalar(1.5));

    const skybox = new Mesh(
      new SphereGeometry(sphere.radius, 32, 32),
      new MeshBasicMaterial({
        transparent: true,
        color: this.color,
        side: DoubleSide,
        opacity: 0.925
      })
    );

    skybox.position.copy(sphere.center);
    return skybox;
  }

  public get skybox (): Mesh {
    return this.sphere;
  }
}
