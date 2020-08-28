import { MeshBasicMaterial } from '@three/materials/MeshBasicMaterial';

import { Settings } from '@/settings';
import { Color } from '@/utils/Color';

export const ColliderMaterial = new MeshBasicMaterial({
  visible: Settings.colliders,
  color: Color.WHITE,
  transparent: true,
  depthWrite: false,
  opacity: 0.5
});

export const HitBoxMaterial = new MeshBasicMaterial({
  visible: Settings.hitBoxes,
  transparent: true,
  depthWrite: false,
  color: Color.RED,
  opacity: 0.33
});
