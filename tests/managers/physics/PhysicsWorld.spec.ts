import '../../globals';

import PhysicsManager from '@/managers/physics';
import PhysicsWorld from '@/managers/physics/PhysicsWorld';

describe('PhysicsWorld', () => {
  test('Create', () => {
    expect(PhysicsManager).toBeInstanceOf(PhysicsWorld);
  });
});
