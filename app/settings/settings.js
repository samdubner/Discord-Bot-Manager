const remote = require("electron").remote;
const app = remote.app;

const fs = require("fs");

var string = fs.readFileSync(app.getPath("appData") + "/DBM/save.txt", "utf8");
var object = JSON.parse(string);

object.keys.forEach(token => {
  var tokenDiv = $(document.createElement("div"));
  var tokenName = $(document.createElement("h4"));
  var i = $(document.createElement("i"));
  tokenName.html(token.name);
  tokenName.addClass("token-name");
  tokenDiv.attr("id", `${token.name}`);
  tokenDiv.addClass("token-div");
  i.addClass("material-icons md-inactive md-dark md-18 trash");
  i.attr("id", `${token.name}-delete`);
  i.html("delete");
  i.css("display", "none");
  $("#user-options").append(tokenDiv);
  $(tokenDiv).append(tokenName);
  $(tokenDiv).append(i);
  $(tokenDiv).append("<br>");
});

$(document).on(
  {
    mouseenter: function() {
      $(`#${$(this).attr("id")}-delete`).show();
    },
    mouseleave: function() {
      $(`#${$(this).attr("id")}-delete`).hide();
    }
  },
  ".token-div"
);

$(document).on("click", ".trash", function() {
  var currentTrash = $(this).parent();
  removed = object.keys.filter(function(token) {
    console.log(`${currentTrash.attr("id")}: ${token.name}`);
    return token.name !== currentTrash.attr("id");
  });
  object.keys = removed;
  $(this)
    .parent()
    .remove();

  string = JSON.stringify(object);
  fs.writeFileSync(app.getPath("appData") + "/DBM/save.txt", string);
});
