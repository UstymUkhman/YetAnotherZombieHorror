import { resolve } from 'path';
import { fork } from 'child_process';

function execute (script, callback) {
  const process = fork(script);

  process.on('error', callback);
  process.on('exit', callback);
}

execute(resolve('./physics.mjs'), error => {
  if (error) {
    console.error('\nPhysics engine configuration failed.');
    throw error;
  }

  console.info('\nPhysics Engine configured successfully.');
});

execute(resolve('./shaders.mjs'), error => {
  if (error) {
    console.error('Shaders compilation failed.\n');
    throw error;
  }

  console.info('Shaders compiled successfully.\n');
});
