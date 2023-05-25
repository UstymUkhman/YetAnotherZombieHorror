import { resolve } from 'path';
import { fork } from 'child_process';

function execute (script, callback) {
  const process = fork(script);

  process.on('error', callback);
  process.on('exit', callback);
}

function throwError (error, message) {
  console.error(message);
  throw error;
}

execute(resolve('./physics.mjs'), error => error
  ? throwError('\nPhysics engine configuration failed.')
  : console.info('\nPhysics Engine configured successfully.')
);

execute(resolve('./shaders.mjs'), error => error
  ? throwError('Shaders compilation failed.\n')
  : console.info('Shaders compiled successfully.\n')
);
