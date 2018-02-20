const remote = require("electron").remote;
const app = remote.app;

const fs = require("fs");

var string = fs.readFileSync(app.getPath("appData") + "/DBM/save.txt", "utf8");
var object = JSON.parse(string);

object.keys.forEach(user => {
  var userDiv = $(document.createElement("h4"));
  userDiv.html(user.name);
  $("#user-options").append(userDiv);
});

$(document).on("click", "#add-user-button", function() {
  if (
    $("#user-name")
      .val()
      .trim() == ""
  ) {
    alert("Do not leave the name blank!");
    return;
  } else if (
    $("#user-token")
      .val()
      .trim() == ""
  ) {
    alert("Do not leave the token blank!");
    return;
  }

  var name = $("#user-name").val();
  var token = $("#user-token").val();
  $("#user-name").val("");
  $("#user-token").val("");

  var userDiv = $(document.createElement("h4"));
  userDiv.html(user.name);
  $("#user-options").append(userDiv);

});
