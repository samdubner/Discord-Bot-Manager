const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

//uses github repo as update server
const GhReleases = require('electron-gh-releases')


let passwordWindow;

app.on('ready', function () {
  var passwordWindow = new BrowserWindow({
    width: 300,
    height: 400,
    resizable: false
  })

  passwordWindow.loadURL('file://' + __dirname + '/app/password/password.html');
  passwordWindow.focus();

  const page = passwordWindow.webContents;

  //waits for page to load before checking for updates
  page.once('did-frame-finish-load', () => {
    let options = {
      repo: 'SamuelDub/DiscordBot-App',
      currentVersion: app.getVersion()
    }

    const updater = new GhReleases(options)

    let updateWindow;

    // Check for updates
    // `status` returns true if there is a new update available
    updater.check((err, status) => {
      if (!err && status) {
        // Download the update
        updater.download()
      } else {
        updateWindow = new BrowserWindow({
          width: 100,
          height: 100
        })
      }
    })

    // When an update has been downloaded
    updater.on('update-downloaded', (info) => {
      // Restart the app and install the update
      updater.install()
    })

    // Access electrons autoUpdater
    updater.autoUpdater
  });
});