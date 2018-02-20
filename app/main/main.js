const Discord = require("discord.js");
const bot = new Discord.Client();

const remote = require("electron").remote;
const BrowserWindow = remote.BrowserWindow;
const app = remote.app;
const ipcRenderer = require("electron").ipcRenderer;

const swal = require("sweetalert2");

const fs = require("fs");

function addToken(firstTime) {
  if (firstTime) {
    var object = {
      keys: []
    };

    string = JSON.stringify(object);

    fs.writeFileSync(app.getPath("appData") + "/DBM/save.txt", string);
  }

  swal.setDefaults({
    title: '<h3 id="changeTokenTitle">Add Bot Token</h3>',
    input: "text",
    inputPlaceholder: "Please enter your bot token",
    showCancelButton: false,
    allowOutsideClick: false,
    background: "#2f3136",
    progressSteps: ["1", "2"],
    inputAttributes: {
      id: "changeTokenText"
    },
    inputValidator: value => {
      return !value && "You cannot submit a blank space!";
    }
  });

  var steps = [
    {
      inputPlaceholder: "Please enter the name for your token."
    },
    {
      inputPlaceholder: "Please enter your bot token."
    }
  ];

  swal.queue(steps).then(result => {
    swal.resetDefaults();

    if (result.value) {
      var string = fs.readFileSync(
        app.getPath("appData") + "/DBM/save.txt",
        "utf8"
      );
      var object = JSON.parse(string);

      object.keys.push({
        name: result.value[0],
        token: result.value[1]
      });

      string = JSON.stringify(object);

      fs.writeFileSync(app.getPath("appData") + "/DBM/save.txt", string);
    }
  });
}

function changeToken() {
  var string = fs.readFileSync(
    app.getPath("appData") + "/DBM/save.txt",
    "utf8"
  );
  var object = JSON.parse(string);
  var names = {};
  object.keys.forEach(key => (names[key.token] = key.name));
  swal({
    title: '<h3 id="changeTokenTitle">Change Current Token</h3>',
    input: "select",
    inputOptions: names,
    inputPlaceholder: "Select Token",
    showCancelButton: false,
    allowOutsideClick: false,
    background: "#2f3136"
  }).then(result => {
    object.keys.forEach(key => {
      if (key.token == result.value) {
        object.keys.sort(function(x, y) {
          return x == key ? -1 : y == key ? 1 : 0;
        });
        string = JSON.stringify(object);
        fs.writeFileSync(app.getPath("appData") + "/DBM/save.txt", string);
        app.relaunch()
        app.exit()
      }
    });
  });
}

if (!fs.existsSync(app.getPath("appData") + "/DBM/save.txt")) {
  addToken(true);
}

ipcRenderer.on("addToken", function(event, data) {
  addToken(false);
});

ipcRenderer.on("changeCurrentToken", function(event, data) {
  changeToken();
});

var online = false;

var channelSelected = false;
var serverId;
var sendChannel;

function getServers() {
  console.log("fetching servers...");
  bot.guilds.forEach(function(server) {
    var serverLabel = $(document.createElement("h3"));
    var serverContainer = $(document.createElement("div"));
    var icon = $(document.createElement("img"));
    serverContainer.addClass("server-container");
    serverContainer.attr("id", server.id);
    serverLabel.html(server.name);
    serverLabel.addClass("server");
    icon.attr("src", server.iconURL);
    icon.attr("id", "icon");
    icon.addClass("pfp");
    $(".left-bar").append(serverContainer);
    $(serverContainer).append(icon);
    $(serverContainer).append(serverLabel);
  });
}

function getDMs() {
  console.log("fetching dms...");
  bot.channels.forEach(function(channel) {
    if (channel.type != "dm" && channel.type != "group") return;
    var serverLabel = $(document.createElement("h3"));
    var serverContainer = $(document.createElement("div"));
    var icon = $(document.createElement("img"));
    serverContainer.addClass("dm-container");
    serverContainer.attr("id", channel.id);
    serverLabel.addClass("dm");
    if (channel.type == "dm") {
      serverContainer.attr("name", channel.recipient.username);
      serverLabel.html(channel.recipient.username);
      icon.attr("src", channel.recipient.displayAvatarURL);
    } else {
      var names = "";
      channel.recipients
        .array()
        .forEach(user => (names += user.username + ", "));
      serverContainer.attr("name", channel.recipients.first().username);
      serverLabel.html(names.trim().slice(0, -1));
      icon.attr("src", "../../icons/group.png");
    }
    icon.attr("id", "icon");
    icon.addClass("pfp");
    $(".left-bar").append(serverContainer);
    $(serverContainer).append(icon);
    $(serverContainer).append(serverLabel);
  });
}

//loads all the guilds when the bot is ready to go
bot.on("ready", function() {
  console.log("logged in!");
  $("#switch").show();
  $(".message-display").empty();
  getServers();
});

//adds message to the text box
function appendMessage(message, isDM) {
  if (message.type != "DEFAULT") return;
  var messageC = $(document.createElement("div"));
  var messageA = $(document.createElement("span"));
  var messageT = $(document.createElement("span"));
  var br = $(document.createElement("br"));
  var messageR = $(document.createElement("span"));
  var pfp = $(document.createElement("img"));
  if (message.deletable) {
    var i = $(document.createElement("i"));
    i.addClass("material-icons md-inactive md-dark md-18 trash");
    i.attr("id", message.id);
    i.html("delete");
  }
  messageT.addClass("message-time");
  pfp.attr("src", message.author.displayAvatarURL);
  pfp.addClass("pfp");
  pfp.attr("id", message.author.id);
  messageA.addClass("message-author");
  messageA.attr("id", message.author.id);
  var colorS;
  if (!isDM) {
    colorS = message.member.displayHexColor;
  }
  if (colorS == "#000000" || isDM) {
    colorS = "#a6a6a6";
  }
  messageA.css("color", colorS);
  messageR.addClass("message-received");
  messageC.addClass("message-holder");
  if (isDM || message.member.nickname == null) {
    var name = message.author.username;
  } else {
    var name = message.member.nickname;
  }
  messageA.html(name);
  messageT.html(message.createdAt);
  messageR.html(message.cleanContent);
  $(".message-display").append(messageC);
  $(messageC).append(pfp);
  $(messageC).append(messageA);
  $(messageC).append(messageT);
  if (message.deletable) $(messageC).append(i);
  $(messageC).append(br);
  $(messageC).append(messageR);
  message.attachments.forEach(attachment => {
    $(messageC).append(
      $(document.createElement("img"))
        .attr("src", attachment.url)
        .addClass("message-image")
    );
  });
  $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
}

//adds message to text box when a message can be seen by the bot
bot.on("message", message => {
  if (channelSelected == true) {
    if (message.channel.id == sendChannel) {
      appendMessage(
        message,
        message.channel.type == "dm" || message.channel.type == "group"
      );
    }
  }
});

//puts the messages in reverse order since they come in newest to oldest
function reverseSend(messages) {
  var messagesReverse = new Map(Array.from(messages).reverse());
  messagesReverse.forEach(function(messageF) {
    appendMessage(
      messageF,
      messageF.channel.type == "dm" || messageF.channel.type == "group"
    );
  });
}

//gets the last 50 messages from the channel when the bot is ready
function getMessages(id) {
  var channelR = bot.channels.get(id);
  channelR
    .fetchMessages({
      limit: 100
    })
    .then(messages => reverseSend(messages));
}

//shows all channels in the server that was clicked
$(document).on("click", ".server-container", function(e) {
  $(".left-bar").empty();
  $(".message-display").empty();
  $("#back").show();
  serverId = $(this).attr("id");

  var textChannels = bot.guilds
    .get(serverId)
    .channels.filter(channel => channel.type == "text")
    .sort((a, b) => a.position - b.position);

  textChannels.forEach(function(channel) {
    var message = $(document.createElement("p"));
    var messageContainer = $(document.createElement("div"));
    messageContainer.addClass("message-container");
    messageContainer.attr("id", channel.id);
    messageContainer.attr("name", channel.name);
    messageContainer.attr("server", channel.guild.name);
    message.addClass("channel");
    message.html("#" + channel.name);
    $(".left-bar").append(messageContainer);
    $(messageContainer).append(message);
  });
});

$(document).on("click", ".dm-container", function(e) {
  $(".message-display").empty();
  channelSelected = true;
  sendChannel = $(this).attr("id");
  serverId = $(this).attr("id");
  $("#message-text").attr("placeholder", "Message @" + $(this).attr("name"));
  $(".dm").removeClass("make-gray");
  $(this)
    .find(".dm")
    .addClass("make-gray");
  $(".message-display").empty();
  getMessages(sendChannel);
});

//shows messages in the channel that was clicked
$(document).on("click", ".message-container", function() {
  channelSelected = true;
  sendChannel = $(this).attr("id");
  var name = $(this).attr("name");
  var server = $(this).attr("server");
  $("#message-text").attr("placeholder", "Message #" + name + " in " + server);
  var clickedChannel = $(this).find(".channel");
  $(".channel").removeClass("make-gray");
  clickedChannel.addClass("make-gray");
  $(".message-display").empty();
  getMessages(sendChannel);
});

function getModalRoles(member) {
  $("#modalRoleList").empty();
  member.roles.sort((a, b) => b.position - a.position).forEach(role => {
    if (role.name != "@everyone") {
      var roleElement = $(document.createElement("li"));
      var roleColor = $(document.createElement("div"));
      var roleName = $(document.createElement("div"));
      roleElement.addClass("modalRole");
      roleColor.addClass("modalRoleColor");
      roleName.addClass("modalRoleName");
      roleName.html(role.name);
      var color =
        role.hexColor == "#000000" ? "hsla(0,0%,100%,.8)" : role.hexColor;
      roleElement.css("border-color", color);
      roleColor.css("background-color", color);
      $("#modalRoleList").append(roleElement);
      $(roleElement).append(roleColor);
      $(roleElement).append(roleName);
    }
  });
}

$(document).on("click", ".message-author", function() {
  var message = $("#message-text").val() + ` <@${$(this).attr("id")}>`;
  $("#message-text").val(message.trim());
});

$(document).on("click", ".pfp", function() {
  var member = bot.guilds.get(serverId).members.get($(this).attr("id"));
  $("#modalProfilePicture").attr("src", member.user.displayAvatarURL);
  var nickname =
    member.nickname == null ? member.user.username : member.nickname;
  $("#modalUserName").html(nickname);
  $("#modalDiscriminator").html(
    `${member.user.username}#${member.user.discriminator}`
  );
  if (member.user.presence.game != null) {
    $(".modalGameName").html(member.user.presence.game.name);
    $(".modalGameName").show();
  }
  getModalRoles(member);
  $("#userModal").css("display", "block");
});

// Get the modal
var modal = document.getElementById("userModal");

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    $(".modalGameName").hide();
  }
};

$(document).on("click", "#back", function() {
  $(".left-bar").empty();
  $(".message-display").empty();
  sendChannel = "";
  $(this).hide();
  getServers();
});

//delete message
$(document).on("click", ".material-icons", function() {
  var messageID = $(this).attr("id");
  bot.channels
    .get(sendChannel)
    .fetchMessage(messageID)
    .then(message => message.delete());
  $(this)
    .parent()
    .remove();
});

$("#switch").click(function() {
  sendChannel = "";
  $(".left-bar").empty();
  $(".message-display").empty();
  if ($(this).val() == "DMs") {
    $(this).val("Servers");
    $("#back").hide();
    getDMs();
  } else {
    $(this).val("DMs");
    getServers();
  }
});

//makes sure the bot is online before attemption to send a message
$("#message-text").on("keydown", function(e) {
  if (e.which == 13) {
    e.preventDefault();
    if (online == false) {
      alert("The bot must be online for you to send a message");
      return;
    } else if (document.getElementById("message-text").value == "") {
      alert("You cannot send a blank message");
      return;
    } else if (channelSelected == false) {
      alert("You must select a channel to send a message in");
      return;
    }

    bot.channels
      .get(sendChannel)
      .send(document.getElementById("message-text").value);
    $("#message-text").val("");
  }
});

function login() {
  if (online == false) {
    var string = fs.readFileSync(
      app.getPath("appData") + "/DBM/save.txt",
      "utf8"
    );
    var object = JSON.parse(string);
    var key = object.keys;
    var error = false;
    bot
      .login(key[0].token)
      .then(token => {
        console.log("logging in...");
        online = true;
        $("#message-text").attr(
          "placeholder",
          "Please select channel to send message to"
        );
      })
      .catch(err => {
        alert(
          "The bot was unable to login, please check your internet connection, and make sure your bot key is correct"
        );
        console.error(err.stack);
      });
  } else {
    alert("The bot is already on");
  }
}

login();
