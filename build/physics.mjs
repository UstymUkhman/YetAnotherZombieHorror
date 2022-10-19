import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const SETTINGS_FILE = resolve('../src/settings/physics.json');
const PHYSICS_FILE  = resolve('../src/physics/index.ts');

const Settings = readFileSync(SETTINGS_FILE).toString();
const Physics  = readFileSync(PHYSICS_FILE).toString();

const lines  = Physics.split('\n');
const ammo   = JSON.parse(Settings).ammo;
const isAmmo = lines[10].includes('Ammo');

if ((ammo && !isAmmo) || (isAmmo && !ammo)) {
  const target  = ammo ? 'Ammo' : 'BVH';
  const current = ammo ? /BVH/g : /Ammo/g;

  lines[ 8] = lines[ 8].replace(current, target);
  lines[10] = lines[10].replace(current, target);

  writeFileSync(PHYSICS_FILE, lines.join('\n'));
}
