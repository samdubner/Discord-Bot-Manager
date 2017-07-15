const GhReleases = require('electron-gh-releases')

let options = {
  repo: 'SamuelDub/DiscordBot-App',
  currentVersion: app.getVersion()
}

const updater = new GhReleases(options)

// Check for updates
// `status` returns true if there is a new update available
updater.check((err, status) => {
  if (!err && status) {
    // Download the update
    updater.download()
  }
})

// When an update has been downloaded
updater.on('update-downloaded', (info) => {
  // Restart the app and install the update
  updater.install()
})

// Access electrons autoUpdater
updater.autoUpdater