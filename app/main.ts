import * as path from 'path';
import { BrowserWindow, app, screen, ipcMain } from 'electron';

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const PRODUCTION = process.env.ENVIRONMENT !== 'development';
let game: Electron.BrowserWindow | null = null;

function createWindow(): void {
  if (game === null) {
    game = new BrowserWindow({
      backgroundColor: '#000',
      fullscreen: PRODUCTION,
      frame: false,

      webPreferences: {
        preload: path.join(__dirname, './preloader.js')
      }
    });

    game.loadFile(path.join(__dirname, '../public/index.html'));
    if (!PRODUCTION) game.webContents.openDevTools();

    game.on('closed', () => {
      game = null;
    });
  }
}

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const ratio = PRODUCTION ? 100 : 83.33333333333333;

  const gameHeight = Math.round(height / 100 * ratio);
  const gameWidth = Math.round(width / 100 * ratio);

  const marginTop = (height - gameHeight) / 2;
  const marginLeft = (width - gameWidth) / 2;

  game.setBounds({
    height: gameHeight,
    width: gameWidth,
    x: marginLeft,
    y: marginTop
  });
});

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
