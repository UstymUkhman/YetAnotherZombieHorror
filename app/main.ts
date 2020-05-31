import * as path from 'path';
import { app, BrowserWindow } from 'electron';

let mainWindow: Electron.BrowserWindow | null = null;
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function createWindow() {
  if (mainWindow === null) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,

      webPreferences: {
        preload: path.join(__dirname, './preload.js'),
      }
    });

    mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
      mainWindow = null;
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
