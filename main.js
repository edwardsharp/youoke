const { app, BrowserWindow, ipcMain } = require('electron');
const electron = require('electron');
const os = require('os');
const fs = require('fs');
const url = require('url');
const path = require('path');

let mainWindow;
//,let playerWindow;
const isDevMode = false;//process.execPath.match(/[\\/]electron/);

const HOMEDIR = `${os.homedir()}/YOUOKE`;

if (!fs.existsSync(HOMEDIR)){
  fs.mkdirSync(HOMEDIR);
}

const createWindow = async () => {
  // Create the browser window.
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: true
  });

  if (isDevMode) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  }else{
    mainWindow.loadURL(url.format({
      pathname: path.join(app.getAppPath(), 'dist/youoke/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }


  // let displays = electron.screen.getAllDisplays()
  // let externalDisplay = displays.find((display) => {
  //   return display.bounds.x !== 0 || display.bounds.y !== 0
  // })

  // let extDisplayDim;
  // if (externalDisplay) {
  //   extDisplayDim = {
  //     x: externalDisplay.bounds.x + 50,
  //     y: externalDisplay.bounds.y + 50,
  //     height: externalDisplay.bounds.height,
  //     width: externalDisplay.bounds.width
  //   }
  // }else{
  //   extDisplayDim = { x: 0, y:0, width: width/2, height: height/2}
  // }

  // playerWindow = new BrowserWindow({
  //   x: extDisplayDim.x,
  //   y: extDisplayDim.y,
  //   width: extDisplayDim.width,
  //   height: extDisplayDim.height,
  //   frame: true
  // });
  // openPlayerWindow();
  // function openPlayerWindow(){
  //   playerWindow.loadURL(url.format({
  //     pathname: path.join(app.getAppPath(), 'dist/youoke/index.html#player'),
  //     protocol: 'file:',
  //     slashes: true
  //   }));
  // }
  // ipcMain.on("openPlayer", () => {
  //   openPlayerWindow();
  // });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
