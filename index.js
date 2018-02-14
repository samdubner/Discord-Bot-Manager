const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;

//moved the menu and the functions that belong with it
//to a different file to reduce clutter
const menu = require("./app/menu.js");

const template = menu.array();

//to check if DBM folder exists
const fs = require("fs");

var dir = app.getPath("appData") + "/DBM";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

let mainWindow;

app.on("ready", function() {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  var mainWindow = new BrowserWindow({
    width,
    height,
    resizable: true
  });

  mainWindow.loadURL("file://" + __dirname + "/app/main/main.html");

  mainWindow.focus();

  const page = mainWindow.webContents;

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  app.on("window-all-closed", function() {
    app.quit();
  });
});

const autoUpdater = require("electron-updater").autoUpdater;

autoUpdater
  .checkForUpdates()
  .then(UpdateCheckResult => console.log(UpdateCheckResult))
  .catch(console.error());

autoUpdater.on("update-downloaded", info => {
  // Restart the app and install the update
  dialog.showMessageBox(
    {
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: `v${
        info.version
      } has been downloaded, would you like to restart the app to update?`
    },
    function(response) {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    }
  );
});
