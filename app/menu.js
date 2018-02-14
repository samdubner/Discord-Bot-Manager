const electron = require("electron");
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;

//to change the bot key
const fs = require("fs");

//electron dosen't support prompts, so I have to use another package :(
const prompt = require("electron-prompt");

//change the token for the bot
function change() {
  prompt({
    title: "Change Bot Key",
    label: "Please enter your new bot key",
    value: "",
    inputAttrs: {
      type: "url"
    }
  })
    .then(response => {
      console.log(response); //null if window was closed, or user clicked Cancel
      if (response == null) {
        return;
      } else {
        fs.unlinkSync(app.getPath("appData") + "/DBM/save.txt");

        var key = {
          key: response
        };

        var string = JSON.stringify(key);

        fs.writeFile(app.getPath("appData") + "/DBM/save.txt", string, function(
          err
        ) {
          if (err) throw err;
        });
      }
    })
    .catch(console.error);
}

//the about page is just the app version 11/10
function about() {
  var message = "Version: " + app.getVersion() + "\n";

  dialog.showMessageBox({
    type: "info",
    buttons: ["Ok"],
    title: "Discord Bot App",
    message: message
  });
}

//opens the settings page
function settings() {
  let settingsWindow = new BrowserWindow({
    width: 700,
    height: 500,
    resizable: false
  });
  settingsWindow.loadURL("file://" + __dirname + "/settings/settings.html");
}

//opens the developer console
function openConsole() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow.webContents.openDevTools();
}

module.exports = {
  array: function() {
    var template = [
      {
        label: "File",
        submenu: [
          //   {
          //     label: "Check For Updates",
          //     click: function() {
          //       check();
          //     }
          //   },
          {
            label: "About",
            click: function() {
              about();
            }
          },
          {
            label: "Settings",
            click: function() {
              settings();
            }
          },
          {
            type: "separator"
          },
          {
            role: "quit"
          }
        ]
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Change Bot Key",
            click: function() {
              change();
            }
          }
        ]
      },
      {
        label: "Window",
        submenu: [
          {
            label: "Open Console",
            accelerator: "f12",
            click: function() {
              openConsole();
            }
          }
        ]
      }
    ];

    return template;
  }
};
