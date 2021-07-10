import { BrowserWindow, app, screen, ipcMain } from 'electron';
import { join } from 'path';

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const PRODUCTION = process.env.ENVIRONMENT !== 'development';
let game: Electron.BrowserWindow | null = null;
const screenRatio = 0.9 + +PRODUCTION * 0.1;

function createWindow(): void {
  if (game !== null) return;

  game = new BrowserWindow({
    webPreferences: {
      ...(!PRODUCTION && {
        preload: join(__dirname, './preloader.js')
      }),

      nodeIntegrationInWorker: false,
      contextIsolation: true,
      nodeIntegration: false
    },

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

  const height = Math.round(screenHeight * screenRatio);
  const width = Math.round(height / 9 * 16);

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
