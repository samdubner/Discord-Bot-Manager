const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

$("#submit").click(function () {
  if($("#password-box").val() == "electron") {

  var passwordWindow = BrowserWindow.getFocusedWindow()
  var window = new BrowserWindow({
    width: 800,
    height: 600
  })
  window.loadURL('file://' + __dirname + '/../main/main.html');
  passwordWindow.close();
} else {
  alert("The passowrd is not correct");
}

});