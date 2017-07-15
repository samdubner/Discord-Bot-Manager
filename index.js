const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog
const Menu = electron.Menu

//uses github repo as update server
const GhReleases = require('electron-gh-releases')

//basic setup for GhReleases
let options = {
  repo: 'SamuelDub/DiscordBot-App',
  currentVersion: app.getVersion()
}

const updater = new GhReleases(options)

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

  // const template = [{
  //   label: 'File',
  //   submenu: [{
  //     label: 'Check For Updates',
  //     click: function () {
  //       updater.check((err, status) => {
  //         if (!err && status) {
  //           dialog.showMessageBox({
  //             type: 'question',
  //             buttons: ['Yes', 'No'],
  //             title: 'Confirm',
  //             message: 'A new update is available, would you like to download it and restart?'
  //           }, function (response) {
  //             if (response === 0) { // Runs the following if 'Yes' is clicked
  //               downloadUpdate;
  //             } else {
  //               dialog.showMessageBox({
  //                 type: 'info',
  //                 buttons: ["Ok"],
  //                 title: 'No update found',
  //                 message: 'No new update was found'
  //               })
  //             }
  //           })
  //         }
  //       })
  //     }
  //   }]
  // }]

  // const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu)

  //waits for page to load before checking for updates
  page.once('did-frame-finish-load', () => {

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
            downloadUpdate();
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