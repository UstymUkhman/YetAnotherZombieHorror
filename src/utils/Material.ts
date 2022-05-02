import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Color } from '@/utils/Color';

export const DynamicCollider = new MeshBasicMaterial({
  color: Color.RED,
  wireframe: true,
  visible: false
});

export const StaticCollider = new MeshBasicMaterial({
  transparent: true,
  depthWrite: false,
  color: Color.RAIN,
  visible: false,
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
  transparent: true,
  depthWrite: false,
  color: Color.RED,
  visible: false,
  opacity: 0.33
});
