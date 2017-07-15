const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog

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
    
    // Check for updates
    // `status` returns true if there is a new update available
    updater.check((err, status) => {
      if (!err && status) {
        dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'A new update is available, would you like to download it and restart?'
        }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
            downloadUpdate;
          }
        })
      }
    })

    function downloadUpdate() {
      updater.download();
    }

    // When an update has been downloaded
    updater.on('update-downloaded', (info) => {
      // Restart the app and install the update
      updater.install()
    })

    // Access electrons autoUpdater
    updater.autoUpdater
  });

});