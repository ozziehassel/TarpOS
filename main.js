const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

ipcMain.on("restartos", ( event ) => {
  app.relaunch();
  app.exit(0);
} );

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })
  mainWindow.loadFile('window/index.html');
  mainWindow.maximize();
  mainWindow.setFullScreen(true);
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  /*if (process.platform !== 'darwin') */app.quit()
})