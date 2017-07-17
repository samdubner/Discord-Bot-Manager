// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const Discord = require('discord.js');
const bot = new Discord.Client();

const fs = require('fs')

var online = false;

bot.on('ready', function () {
    bot.guilds.forEach(function (server) {
        var serverLabel = $(document.createElement('h3'));
        var serverContainer = $(document.createElement('div'));
        serverContainer.addClass('server-container')
        serverLabel.html(server.name)
        serverLabel.addClass('server')
        $('.text-display').append(serverContainer)
        $(serverContainer).append(serverLabel)
        server.channels.forEach(function (channel) {
            if (channel.type == "text") {
                console.log(channel.name)
                var message = $(document.createElement('p'))
                message.addClass("channel")
                message.html("#" + channel.name);
                $(".text-display").append(message)
            }
        })
    })
})

$("#start").click(function () {
    if (online == false) {
        var string = fs.readFileSync('../save.txt', 'utf8')
        var object = JSON.parse(string)
        var key = object.key;
        bot.login(key);
        online = true;
    } else {
        alert("The bot is already on");
    }
    return;
})

$("#stop").click(function () {
    if (online == true) {
        bot.destroy();
        online = false;
    } else {
        alert("The bot is not online");
    }
    return;
})

$("#send").click(function () {
    if (online == false) {
        alert("The bot must be online for you to send a message");
        return;
    } else if (document.getElementById("message-text").value == "") {
        alert("You cannot send a blank message");
        return;
    }
    bot.channels.get("284565341869309962").send(document.getElementById("message-text").value);
    document.getElementById("message-text").value = "";

})