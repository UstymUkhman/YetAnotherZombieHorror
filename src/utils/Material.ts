import { MeshBasicMaterial } from '@three/materials/MeshBasicMaterial';

import { Settings } from '@/settings';
import { Color } from '@/utils/Color';

export const DynamicCollider = new MeshBasicMaterial({
  visible: Settings.colliders,
  color: Color.RED,
  wireframe: true
});

export const StaticCollider = new MeshBasicMaterial({
  visible: Settings.colliders,
  color: Color.GREY,
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
  visible: Settings.hitBoxes,
  transparent: true,
  depthWrite: false,
  color: Color.RED,
  opacity: 0.33
});
