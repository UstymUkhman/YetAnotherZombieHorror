import { exec, execSync } from 'child_process';

if (process.argv.slice(2)[0] === '--staging') {
  const URL = 'http://192.168.3.8:3000/dist/index.html';

  const command = process.platform === 'win32' ? 'start'
    : process.platform == 'darwin' ? 'open' : 'xdg-open';

  execSync(`${command} ${URL}`);
  exec('npx simple-server');
}

else exec('vite preview');
