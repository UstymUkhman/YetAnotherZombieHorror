/**
 * This file is dynamically configured by the "pnpm setup" script.
 *
 * Avoid any change to lines 8 - 11 as they are generated via "build/physics.mjs"
 * script which relies on the "ammo" option in "src/settings/physics.json".
 */

import PhysicsSettings from '@/settings/physics.json';
import BVHPhysics from '@/physics/BVHPhysics';

const Physics = new BVHPhysics();
const isAmmo = Physics.constructor.name.includes('Ammo');

const ammo = PhysicsSettings.engine === 'ammo' && !isAmmo;
const bvh = isAmmo && PhysicsSettings.engine === 'bvh';

if (!PRODUCTION && (ammo || bvh)) {
  console.warn(
    'Physics settings don\'t match the actual engine in use.', '\n',
    'Please run "pnpm setup" if you\'ve changed physics settings in JSON file', '\n',
    'or update "ammo" option if you have changed "src/physics/index.ts" manually.'
  );
}

export default Physics;
