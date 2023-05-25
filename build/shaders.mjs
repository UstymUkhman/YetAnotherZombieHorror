import {
  stat,
  readdir,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync
} from 'fs';

import { EOL } from 'os';
import { join, resolve, dirname } from 'path';
import { default as glsl } from 'vite-plugin-glsl';

const SHADER_DIR = resolve('../src/shaders');

const OUTPUT_PATH = path.replace(SHADER_DIR,
  resolve('../public/assets/shaders')
);

const OUTPUT_DIR = dirname(OUTPUT_PATH);

function compileShader (path) {
  let shader = readFileSync(path).toString();
  shader = glsl().transform(shader, path);

  shader = shader.replace(/\\t/g, '  ');
  shader = shader.replace(/\\n/g, EOL);
  shader = shader.replace(/\\r/g, '');
  shader = shader.slice(16.0, -2.0);

  !existsSync(OUTPUT_DIR) && mkdirSync(OUTPUT_DIR);
  writeFileSync(OUTPUT_PATH, shader);
}

function readShaderDirectory (directory) {
  readdir(directory, (_, files) => {
    files.forEach(file => {
      const path = join(directory, file);

      stat(path, (_, stat) => {
        if (stat.isFile()) compileShader(path);

        else if (stat.isDirectory())
          readShaderDirectory(path);
      });
    });
  });
}

readShaderDirectory(SHADER_DIR);
