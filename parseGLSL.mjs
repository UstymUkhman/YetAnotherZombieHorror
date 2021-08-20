import { join, resolve } from 'path';
import { readdir, stat, readFileSync, writeFileSync } from 'fs';

const SHADER_DIR = join(resolve(), './src/shaders');

function addExport (shader) {
  shader = `export default \`\n${shader.trim()}`;
  shader = `${shader}\n\`\n`;
  return shader;
}

function removeExport (shader) {
  return shader.slice(shader.indexOf('`') + 2, -2);
}

function readShaderDirectory (directory, build) {
  readdir(directory, (err, files) => {
    files.forEach(file => {
      const path = join(directory, file);

      stat(path, (error, stat) => {
        if (stat.isFile()) {
          const shader = readFileSync(path).toString();

          writeFileSync(path, build
            ? addExport(shader)
            : removeExport(shader)
          );
        }

        else if (stat.isDirectory()) {
          readShaderDirectory(path, build);
        }
      });
    });
  });
}

const add = process.argv.slice(2)[0];
readShaderDirectory(SHADER_DIR, add === '--build');
