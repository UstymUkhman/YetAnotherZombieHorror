import { join } from 'path';
import { WebPreferences, BrowserWindow, app, screen, ipcMain } from 'electron';

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const PRODUCTION = process.env.ENVIRONMENT !== 'development';
let game: Electron.BrowserWindow | null = null;
const screenRatio = 0.9 + +PRODUCTION * 0.1;

function createWindow(): void {
  if (game !== null) return;

  game = new BrowserWindow({
    webPreferences: !PRODUCTION && ({
      preload: join(__dirname, './preloader.js')
    } as WebPreferences) || undefined,

    backgroundColor: '#000000',
    fullscreen: PRODUCTION,
    frame: false
  });

  game.loadFile(join(__dirname, '../dist/index.html'));
  game.on('closed', (): null | void => game = null);
  if (!PRODUCTION) game.webContents.openDevTools();
}

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const gameHeight = Math.round(height * screenRatio);
  const gameWidth = Math.round(width * screenRatio);

  const marginTop = (height - gameHeight) / 2;
  const marginLeft = (width - gameWidth) / 2;

  game?.setBounds({
    height: gameHeight,
    width: gameWidth,
    x: marginLeft,
    y: marginTop
  });
});

app.on('ready', createWindow);
app.on('activate', createWindow);

app.on('window-all-closed', (): boolean | void =>
  process.platform !== 'darwin' && app.quit()
);

ipcMain.on('close', (): void => game?.close());
