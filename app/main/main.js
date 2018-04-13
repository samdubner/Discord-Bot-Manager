const Discord = require("discord.js");
const bot = new Discord.Client();

const remote = require("electron").remote;
const BrowserWindow = remote.BrowserWindow;
const app = remote.app;
const ipcRenderer = require("electron").ipcRenderer;
const shell = require("electron").shell;

const moment = require("moment");

const Remarkable = require("remarkable");
const md = new Remarkable();

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
    allowEscapeKey: false,
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
    allowEscapeKey: false,
    background: "#2f3136"
  }).then(result => {
    object.keys.forEach(key => {
      if (key.token == result.value) {
        object.keys.sort(function (x, y) {
          return x == key ? -1 : y == key ? 1 : 0;
        });
        string = JSON.stringify(object);
        fs.writeFileSync(app.getPath("appData") + "/DBM/save.txt", string);
        app.relaunch();
        app.exit();
      }
    });
  });
}

if (!fs.existsSync(app.getPath("appData") + "/DBM/save.txt")) {
  addToken(true);
}

ipcRenderer.on("addToken", function (event, data) {
  addToken(false);
});

ipcRenderer.on("changeCurrentToken", function (event, data) {
  changeToken();
});

ipcRenderer.on("reconnect", function (event, data) {
  login();
})

var online = false;

var channelSelected = false;
var serverId;
var sendChannel;

var firstMessageID;

function getServers() {
  bot.guilds.forEach(function (server) {
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
  bot.channels.forEach(function (channel) {
    if (channel.type != "dm" && channel.type != "group") return;
    var dmLabel = $(document.createElement("h3"));
    var dmContainer = $(document.createElement("div"));
    var icon = $(document.createElement("img"));
    dmContainer.addClass("dm-container");
    dmContainer.attr("id", channel.id);
    dmLabel.addClass("dm");
    if (channel.type == "dm") {
      dmContainer.attr("name", channel.recipient.username);
      dmLabel.html(channel.recipient.username);
      icon.attr("src", channel.recipient.displayAvatarURL);
    } else {
      var names = "";
      channel.recipients
        .array()
        .forEach(user => (names += user.username + ", "));
      if (channel.name == null) {
        dmContainer.attr("name", "@" + channel.recipients.first().username);
        dmLabel.html(names.trim().slice(0, -1));
      } else {
        dmContainer.attr("name", channel.name);
        dmLabel.html(channel.name);
      }
      icon.attr("src", "../../icons/group.png");
    }
    icon.attr("id", "icon");
    icon.addClass("pfp");
    $(".left-bar").append(dmContainer);
    $(dmContainer).append(icon);
    $(dmContainer).append(dmLabel);
  });
}

//loads all the guilds when the bot is ready to go
bot.on("ready", function () {
  $("#switch").show();
  $(".message-display").empty();
  $("#user-name").html(bot.user.username);
  $("#user-pfp").attr("src", bot.user.displayAvatarURL);
  getServers();
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
  if (newMember.id != bot.user.id) return;
  if (newMember.voiceChannel == null) {
    $(".left-bar").css("height", "86%");
    $(".left-bar").css("bottom", "7%");
    $("#voice-container").hide();
  } else if (newMember.voiceChannel != null) {
    $(".left-bar").css("height", "calc(86% - 4.2em)");
    $(".left-bar").css("bottom", "calc(7% + 4.2em)");
    $("#voice-status").html(
      `${newMember.voiceChannel.name} / ${newMember.guild.name}`
    );
    $("#voice-container").show();
  }
});

function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '">' + url + "</a>";
  });
}

//open links externally by default
$(document).on("click", 'a[href^="http"]', function (event) {
  event.preventDefault();
  shell.openExternal(this.href);
});

//adds message to the text box
function appendMessage(message, isDM, prepend) {
  if (message.type != "DEFAULT") return;
  if (
    $(".message-display")
      .children()
      .last()
      .attr("author") == message.author.id
  ) {
    if (message.deletable) {
      var i = $(document.createElement("i"));
      i.addClass("material-icons md-inactive md-dark md-18 trash");
      i.attr("id", message.id);
      i.html("delete");
    }

    var text = md.render(message.cleanContent);
    text = urlify(text);

    var messageContentHolder = $(document.createElement("div"));
    messageContentHolder.addClass("message-content-holder");

    var messageContent = $(document.createElement("span"));
    messageContent.addClass("message-received");
    messageContent.html(text);

    messageContentHolder.append(messageContent);
    messageContentHolder.append(i);

    message.attachments.forEach(attachment => {
      messageContentHolder.append(
        $(document.createElement("img"))
          .attr("src", attachment.url)
          .addClass("message-image")
      );
    });

    $(
      $(".message-display")
        .children()
        .last()
    ).append(messageContentHolder);
    $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
    return;
  }

  var colorS = "#000000";
  if (!isDM && !(message.member == null)) {
    colorS = message.member.displayHexColor;
  }
  if (colorS == "#000000" || isDM) {
    colorS = "#a6a6a6";
  }

  if (isDM || message.member.nickname == null) {
    var name = message.author.username;
  } else {
    var name = message.member.nickname;
  }

  var momentDate = moment(message.createdAt);
  momentDate = momentDate.calendar();

  var text = md.render(message.cleanContent);
  text = urlify(text);

  var messageContainer = $(document.createElement("div"));
  messageContainer.addClass("message-holder");
  messageContainer.attr("id", message.id);
  messageContainer.attr("author", message.author.id);

  var messageAuthor = $(document.createElement("span"));
  messageAuthor.addClass("message-author");
  messageAuthor.attr("id", message.author.id);
  messageAuthor.css("color", colorS);
  messageAuthor.html(name);

  var messageTime = $(document.createElement("span"));
  messageTime.addClass("message-time");
  messageTime.html(momentDate);

  var messageContentHolder = $(document.createElement("div"));
  messageContentHolder.addClass("message-content-holder");

  var messageContent = $(document.createElement("span"));
  messageContent.addClass("message-received");
  messageContent.html(text);

  var pfp = $(document.createElement("img"));
  pfp.attr("src", message.author.displayAvatarURL);
  pfp.addClass("pfp");
  pfp.attr("id", message.author.id);

  if (message.deletable) {
    var i = $(document.createElement("i"));
    i.addClass("material-icons md-inactive md-dark md-18 trash");
    i.attr("id", message.id);
    i.html("delete");
  }

  if (!prepend) {
    $(".message-display").append(messageContainer);
  } else {
    $(".message-display").prepend(messageContainer);
  }

  messageContainer.append(pfp);
  messageContainer.append(messageAuthor);
  messageContainer.append(messageTime);
  if (message.deletable) messageContainer.append(i);
  messageContainer.append($(document.createElement("br")));
  messageContentHolder.append(messageContent);
  messageContentHolder.append(i);
  messageContainer.append(messageContentHolder);
  message.attachments.forEach(attachment => {
    messageContainer.append(
      $(document.createElement("img"))
        .attr("src", attachment.url)
        .addClass("message-image")
    );
  });
  if (!prepend)
    $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
}

//adds message to text box when a message can be seen by the bot
bot.on("message", message => {
  if (channelSelected) {
    if (message.channel.id == sendChannel) {
      appendMessage(
        message,
        message.channel.type == "dm" || message.channel.type == "group",
        false
      );
    }
  }
});

//puts the messages in reverse order since they come in newest to oldest
function reverseSend(messages) {
  firstMessageID = messages.last().id;
  var messagesReverse = new Map(Array.from(messages).reverse());
  messagesReverse.forEach(function (messageF) {
    appendMessage(
      messageF,
      messageF.channel.type == "dm" || messageF.channel.type == "group",
      false
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
$(document).on("click", ".server-container", function (e) {
  $(".left-bar").empty();
  $(".message-display").empty();
  $("#back").show();
  serverId = $(this).attr("id");

  var textChannels = bot.guilds
    .get(serverId)
    .channels.filter(channel => channel.type == "text")
    .sort((a, b) => a.position - b.position);

  textChannels.forEach(function (channel) {
    var channelName = $(document.createElement("p"));
    var channelContainer = $(document.createElement("div"));
    channelContainer.addClass("channel-container");
    channelContainer.addClass("text-channel");
    channelContainer.attr("id", channel.id);
    channelContainer.attr("name", channel.name);
    channelContainer.attr("server", channel.guild.name);
    channelName.addClass("channel");
    channelName.html("# " + channel.name);
    $(".left-bar").append(channelContainer);
    $(channelContainer).append(channelName);
  });
});

$(document).on("click", ".dm-container", function (e) {
  $(".message-display").empty();
  channelSelected = true;
  sendChannel = $(this).attr("id");
  serverId = $(this).attr("id");
  $("#message-text").attr("placeholder", "Message " + $(this).attr("name"));
  $(".dm").removeClass("highlight-title");
  $(".dm-container").removeClass("highlight");
  $(this).addClass("highlight");
  $(this)
    .find(".dm")
    .addClass("highlight-title");
  $(".message-display").empty();
  getMessages(sendChannel);
});

//shows messages in the channel that was clicked
$(document).on("click", ".channel-container", function () {
  if ($(this).hasClass("voice-channel")) return;
  channelSelected = true;
  sendChannel = $(this).attr("id");
  var name = $(this).attr("name");
  var server = $(this).attr("server");
  $("#message-text").attr("placeholder", "Message #" + name + " in " + server);
  var clickedChannel = $(this).find(".channel");
  $(".channel").removeClass("highlight-title");
  $(".channel-container").removeClass("highlight");
  clickedChannel.addClass("highlight-title");
  $(this).addClass("highlight");
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

function warn() {
  $("#modalRoleList").empty();
  var warningElement = $(document.createElement("li"));
  var warningMessage = $(document.createElement("div"));
  warningElement.addClass("modalRole");
  warningMessage.addClass("modalRoleName");
  if (bot.user.bot) {
    warningMessage.html("This is a bot account!");
    warningElement.css("border-color", "#5be8d9");
  } else {
    warningMessage.html(
      "We have detected that this is a user account, please only use this app for bots!"
    );
    warningElement.css("border-color", "#ff0000");
  }
  $("#modalRoleList").append(warningElement);
  $(warningElement).append(warningMessage);
}

$(document).on("click", ".message-author", function () {
  var message = $("#message-text").val() + ` <@${$(this).attr("id")}>`;
  $("#message-text").val(message.trim());
});

$(document).on("click", ".pfp", function () {
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

$(document).on("click", "#user-pfp", function () {
  $("#modalProfilePicture").attr("src", bot.user.displayAvatarURL);
  $("#modalUserName").html(bot.user.username);
  $("#modalDiscriminator").html(
    `${bot.user.username}#${bot.user.discriminator}`
  );
  if (bot.user.presence.game != null) {
    $(".modalGameName").html(bot.user.presence.game.name);
    $(".modalGameName").show();
  }
  warn();
  $("#userModal").css("display", "block");
});

// Get the modal
var modal = document.getElementById("userModal");

// When the user clicks anywhere outside of the user modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    $(".modalGameName").hide();
  }
};

$(document).on("click", "#back", function () {
  $(".left-bar").empty();
  $(".message-display").empty();
  $("#message-text").attr(
    "placeholder",
    "Please select a channel to send messages in"
  );
  sendChannel = "";
  $(this).hide();
  getServers();
});

//delete message
$(document).on("click", ".material-icons", function () {
  var messageID = $(this).attr("id");
  bot.channels
    .get(sendChannel)
    .fetchMessage(messageID)
    .then(message => message.delete());

  if (
    $(this)
      .parent()
      .parent()
      .find(".message-content-holder").length == 1
  ) {
    $(this)
      .parent()
      .parent()
      .remove();
  } else {
    $(this)
      .parent()
      .remove();
  }
});

$("#switch").click(function () {
  $("#message-text").attr(
    "placeholder",
    "Please select a channel to send messages in"
  );
  sendChannel = "";
  $(".left-bar").empty();
  $(".message-display").empty();
  if ($(this).val() == "DMs") {
    $(this).val("Servers");
    $("#back").hide();
    $("#search-text").show();
    getDMs();
  } else {
    $(this).val("DMs");
    $("#search-text")
      .hide()
      .val("");
    getServers();
  }
});

//makes sure the bot is online before attemption to send a message
$("#message-text").on("keydown", function (e) {
  if (e.which == 13) {
    e.preventDefault();
    if (!online) {
      alert("The bot must be online for you to send a message");
      return;
    } else if (document.getElementById("message-text").value == "") {
      return;
    } else if (!channelSelected) {
      alert("You must select a channel to send a message in");
      return;
    }

    bot.channels
      .get(sendChannel)
      .send(document.getElementById("message-text").value);
    $("#message-text").val("");
  }
});

$(".message-display").scroll(function () {
  if ($(".message-display").scrollTop() == 0) {
    var channelR = bot.channels.get(sendChannel);
    if (channelR == undefined) return;
    channelR
      .fetchMessages({
        limit: 50,
        before: firstMessageID
      })
      .then(messages => {
        if (messages.size == 0) return;
        firstMessageID = messages.last().id;
        messages.forEach(message =>
          appendMessage(
            message,
            messages.first().channel.type == "dm" ||
            messages.first().channel.type == "group",
            true
          )
        );
      });
  }
});

function login() {
  if (!online) {
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
        online = true;
        $("#message-text").attr(
          "placeholder",
          "Please select a channel to send messages in"
        );
      })
      .catch(err => {
        $("#user-pfp").remove();
        $("#message-text").attr("placeholder", "Please retry connection...")
        $("#user-name").html("Unable to log in")
        $("#loading-title").html("Bot failed to log in, please check your internet connection, and try restarting the app :(")
        alert(
          "The bot was unable to login, please check your internet connection, and make sure your bot key is correct"
        );
        console.error(err);
      });
  } else {
    alert("The bot is already on");
  }
}

login();
