const isDev = require('electron-is-dev'); // this is required to check if the app is running in development mode. 
const {
  appUpdater
} = require('./autoupdater');

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

if (require('electron-squirrel-startup')) {
	app.quit();
}

let passwordWindow;

function isWindowsOrmacOS() {
	return process.platform === 'darwin' || process.platform === 'win32';
}

app.on('ready', function () {
  var passwordWindow = new BrowserWindow({
    width: 300,
    height: 400,
    resizable: false
  })

  passwordWindow.loadURL('file://' + __dirname + '/app/password/password.html');
  passwordWindow.focus();

  const page = passwordWindow.webContents;

  page.once('did-frame-finish-load', () => {
    const checkOS = isWindowsOrmacOS();
    if (checkOS && !isDev) {
      // Initate auto-updates on macOs and windows
      appUpdater();
    }
  });
});