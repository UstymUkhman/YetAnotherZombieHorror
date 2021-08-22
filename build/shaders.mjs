import {
  stat,
  readdir,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync
} from 'fs';

import { EOL } from 'os';
import glsl from 'vite-plugin-glsl';
import { join, resolve, dirname } from 'path';

const SHADER_DIR = join(resolve(), 'src/shaders');
const OUTPUT_DIR = join(resolve(), 'public/assets/shaders');

function compileShader (path) {
  let shader = readFileSync(path).toString();
  shader = glsl.default().transform(shader, path);

  shader = shader.replace(/\\n/g, EOL);
  shader = shader.replace(/\\r/g, '');
  shader = shader.slice(16, -2);

  const outputPath = path.replace(SHADER_DIR, OUTPUT_DIR);
  const outputDir = dirname(outputPath);

  !existsSync(outputDir) && mkdirSync(outputDir);
  writeFileSync(outputPath, shader);
}

function readShaderDirectory (directory) {
  readdir(directory, (_, files) => {
    files.forEach(file => {
      const path = join(directory, file);

      stat(path, (_, stat) => {
        if (stat.isFile()) {
          compileShader(path);
        }

        else if (stat.isDirectory()) {
          readShaderDirectory(path);
        }
      });
    });
  });
}

readShaderDirectory(SHADER_DIR);
