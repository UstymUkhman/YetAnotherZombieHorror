import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Color } from '@/utils/Color';
import Configs from '@/configs';

export const DynamicCollider = new MeshBasicMaterial({
  visible: Configs.colliders,
  color: Color.RED,
  wireframe: true
});

export const StaticCollider = new MeshBasicMaterial({
  visible: Configs.colliders,
  color: Color.GRAY,
  transparent: true,
  depthWrite: false,
  opacity: 0.5
});

export const Transparent = new MeshBasicMaterial({
  color: Color.BLACK,
  transparent: true,
  depthWrite: false,
  visible: false,
  opacity: 0.0
});

export const HitBox = new MeshBasicMaterial({
  visible: Configs.hitBoxes,
  transparent: true,
  depthWrite: false,
  color: Color.RED,
  opacity: 0.33
});
