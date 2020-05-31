"use strict";
exports.__esModule = true;
var path = require("path");
var electron_1 = require("electron");
var mainWindow = null;
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
function createWindow() {
    if (mainWindow === null) {
        mainWindow = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, './preload.js')
            }
        });
        mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
        mainWindow.webContents.openDevTools();
        mainWindow.on('closed', function () {
            mainWindow = null;
        });
    }
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map