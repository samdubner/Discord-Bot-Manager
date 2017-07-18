const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

const fs = require('fs')

function submitToken() {
  var input = $("#password-box").val();

  var key = {
    "key": input
  };

  var string = JSON.stringify(key)

  fs.writeFile('../save.txt', string, function (err) {
    if (err) throw err;
  });
  var passwordWindow = BrowserWindow.getFocusedWindow()
  var window = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false
  })
  window.loadURL('file://' + __dirname + '/../main/main.html');
  passwordWindow.close();

}

$("#submit").click(function () {
  if ($("#password-box").val() == "") {
    alert("You cannot submit a blank for your token");
    return;
  }
  submitToken()
});

$('input[type=text]').on('keydown', function (e) {
  if (e.which == 13) {
    e.preventDefault();
    if ($("#password-box").val() == "") {
      alert("You cannot submit a blank for your token");
      return;
    }
    submitToken();
  }
});