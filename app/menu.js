const electron = require('electron')
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow

//to get the version number of the app
const pckg = require("../package.json")

//to change the bot key
const fs = require('fs')

//uses github repo as update server
const GhReleases = require('electron-gh-releases')

//electron dosen't support prompts, so I have to use another package :(
const prompt = require('electron-prompt')

//basic setup for GhReleases
let options = {
    repo: 'SamuelDub/DiscordBot-App',
    currentVersion: app.getVersion()
}

const updater = new GhReleases(options)


function check() {
    updater.check((err, status) => {
        if (!err && status) {
            dialog.showMessageBox({
                type: 'question',
                buttons: ['Yes', 'No'],
                title: 'Confirm',
                message: 'A new update is available, would you like to download it and restart?'
            }, function (response) {
                if (response === 0) { // Runs the following if 'Yes' is clicked
                    updater.download();
                }
            })
        } else {
            dialog.showMessageBox({
                type: 'info',
                buttons: ['Ok'],
                title: 'No new update is available',
                message: 'There are currently no new updates available'
            })
        }
    })

}

function change() {
    prompt({
            title: 'Change Bot Key',
            label: 'Please enter your new bot key',
            value: '',
            inputAttrs: {
                type: 'url'
            }
        })
        .then((response) => {
            console.log(response); //null if window was closed, or user clicked Cancel 
            if (response == null) {
                return;
            } else {
                fs.unlinkSync("../save.txt");

                var key = {
                    "key": response
                };

                var string = JSON.stringify(key)

                fs.writeFile('../save.txt', string, function (err) {
                    if (err) throw err;
                });
            }
        })
        .catch(console.error);
}

function about() {
    var message = "Version: " + pckg.version + "\n"

    dialog.showMessageBox({
        type: 'info',
        buttons: ['Ok'],
        title: 'Discord Bot App',
        message: message
    })
}

function openConsole() {
    var focusedWindow = BrowserWindow.getFocusedWindow();
    focusedWindow.webContents.openDevTools()
}

module.exports = {
    array: function () {

        var template = [{
                label: 'File',
                submenu: [{
                        label: 'Check For Updates',
                        click: function () {
                            check();
                        }
                    },
                    {
                        label: 'About',
                        click: function () {
                            about();
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
                label: 'Edit',
                submenu: [{
                    label: 'Change Bot Key',
                    click: function () {
                        change();
                    }
                }]
            },
            {
                label: 'Window',
                submenu: [{
                    label: 'Open Console',
                    click: function () {
                        openConsole();
                    }
                }]
            }
        ]

        return template;

    }
}