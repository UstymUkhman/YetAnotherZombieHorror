import { join, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const SETTINGS_FILE = join(resolve(), 'src/configs/settings.json');
const PHYSICS_FILE = join(resolve(), 'src/physics/index.ts');

const Settings = readFileSync(SETTINGS_FILE).toString();
const Physics = readFileSync(PHYSICS_FILE).toString();
const ammoPhysics = JSON.parse(Settings).ammoPhysics;

const lines = Physics.split('\n');
const isAmmo = lines[10].includes('Ammo');

if ((ammoPhysics && !isAmmo) || (isAmmo && !ammoPhysics)) {
  const target = ammoPhysics ? 'Ammo' : 'BVH';
  const current = ammoPhysics ? /BVH/g : /Ammo/g;

  lines[ 8] = lines[ 8].replace(current, target);
  lines[10] = lines[10].replace(current, target);

  writeFileSync(PHYSICS_FILE, lines.join('\n'));
}
