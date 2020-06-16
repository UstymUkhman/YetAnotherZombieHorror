import * as path from 'path';
import { BrowserWindow, app, ipcMain } from 'electron';

let game: Electron.BrowserWindow | null = null;
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function createWindow() {
  if (game === null) {
    game = new BrowserWindow({
      backgroundColor: '#000',
      frame: false,

      height: 900,
      width: 1600,

      webPreferences: {
        preload: path.join(__dirname, './preloader.js'),
      }
    });

    game.loadFile(path.join(__dirname, '../public/index.html'));

    if (!process.env.PRODUCTION) {
      game.webContents.openDevTools();
    }

    game.on('closed', () => {
      game = null;
    });
  }
}

app.on('ready', createWindow);
app.on('activate', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('close', (): void => {
  game.close();
});
