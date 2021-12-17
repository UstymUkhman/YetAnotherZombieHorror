/**
 * This file is dynamically configured by the "yarn setup" script.
 *
 * Avoid any change to lines 8 - 11 as they are generated via "build/physics.mjs"
 * script which relies on the "ammoPhysics" option in "src/configs/settings.json".
 */

import BVHPhysics from '@/physics/BVHPhysics';
import Settings from '@/settings';

const Physics = new BVHPhysics();
const isAmmo = Physics.constructor.name.includes('Ammo');

const ammo = Settings.ammoPhysics && !isAmmo;
const bvh = isAmmo && !Settings.ammoPhysics;

if (!PRODUCTION && (ammo || bvh)) {
  console.warn(
    'Physics settings don\'t match the actual engine in use.', '\n',
    'Please run "yarn setup" if you\'ve changed physics settings in JSON file', '\n',
    'or update "ammoPhysics" option if you have changed \'src/physics/index.ts\' manually.'
  );
}

export default Physics;
