const electron = require("electron");
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;

//to change the bot key
const fs = require("fs");

//change the token for the bot
function add() {
  const mainWindow = BrowserWindow.getFocusedWindow();
  mainWindow.webContents.send("addToken");
}

function change() {
  const mainWindow = BrowserWindow.getFocusedWindow();
  mainWindow.webContents.send("changeCurrentToken");
}

function reconnect() {
  const mainWindow = BrowserWindow.getFocusedWindow();
  mainWindow.webContents.send("reconnect");
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
          // {
          //   label: "Reconnect",
          //   click: function() {
          //     reconnect();
          //   }
          // },
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
            label: "Add Token",
            click: function() {
              add();
            }
          },
          {
            label: "Change Current Token",
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
