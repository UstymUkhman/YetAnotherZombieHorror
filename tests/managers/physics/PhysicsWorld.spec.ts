import '../../globals';
import { Config } from '@/config';

import PhysicsWorld from '@/managers/physics';
import BVHPhysics from '@/managers/physics/BVHPhysics';
import AmmoPhysics from '@/managers/physics/AmmoPhysics';

describe('PhysicsWorld', () => {
  const ammo = Config.Settings.ammoPhysics;

  test('Create', () => {
    expect(PhysicsWorld).toBeInstanceOf(
      ammo ? AmmoPhysics : BVHPhysics
    );
  });
});
