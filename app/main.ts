import { join } from 'path';
import { BrowserWindow, app, screen, ipcMain } from 'electron';

const PRODUCTION = process.env.ENVIRONMENT !== 'development';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;

const SCREEN_RATIO = 0.9 + +PRODUCTION * 0.1;
let game: BrowserWindow | null = null;
const TARGET_RATIO = 16 / 9;

function createWindow(): void {
  if (game !== null) return;

  game = new BrowserWindow({
    webPreferences: !PRODUCTION && ({
      preload: join(__dirname, './preloader.js')
    }) || undefined,

    backgroundColor: '#000000',
    fullscreen: PRODUCTION,
    frame: false
  });

  game.loadFile(join(__dirname, '../../dist/index.html'));
  !PRODUCTION && game.webContents.openDevTools();
  game.on('closed', () => game = null);
}

app.whenReady().then(() => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const width = Math.round(screenWidth * SCREEN_RATIO);
  const height = Math.round(width / TARGET_RATIO);

  const y = (screenHeight - height) / 2.0;
  const x = (screenWidth - width) / 2.0;

  game?.setBounds({ height, width, x, y });
});

app.on('ready', createWindow);
app.on('activate', createWindow);

app.on('window-all-closed', () =>
  process.platform !== 'darwin' && app.quit()
);

app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => ({
    action: 'deny'
  }));
});

ipcMain.on('exit', () => game?.close());
