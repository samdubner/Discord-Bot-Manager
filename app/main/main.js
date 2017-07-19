// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const Discord = require('discord.js');
const bot = new Discord.Client();

const fs = require('fs')

var online = false;

var channelSelected = false;
var sendChannel;

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
                var message = $(document.createElement('p'))
                var messageContainer = $(document.createElement('div'))
                messageContainer.addClass('message-container')
                messageContainer.attr('id', channel.id)
                messageContainer.attr('name', channel.name)
                messageContainer.attr('server', channel.guild.name)
                message.addClass("channel")
                message.html("#" + channel.name);
                $('.text-display').append(messageContainer)
                $(messageContainer).append(message)
            }
        })
    })
})

bot.on('message', function() {
    console.log('message')
})

// function changeColor() {
//     console.log("clicked")
//     $(this).toggleClass('make-gray');
// }

$(document).on('click', '.message-container', function () {
    channelSelected = true;
    sendChannel = $(this).attr('id')
    var name = $(this).attr('name')
    var server = $(this).attr('server')
    $('#message-text').attr('placeholder', 'send message to #' + name + " in " + server)
    $(".message-container").removeClass('make-gray')
    $(this).toggleClass('make-gray')
})

$("#start").click(function () {
    if (online == false) {
        var string = fs.readFileSync('../save.txt', 'utf8')
        var object = JSON.parse(string)
        var key = object.key;
        bot.login(key);
        online = true;
        $('#message-text').attr('placeholder', 'Please select channel to send message to')
    } else {
        alert("The bot is already on");
    }
    return;
})

$("#stop").click(function () {
    if (online == true) {
        bot.destroy();
        online = false;
        $('#message-text').attr('placeholder', 'Bot must be online to send messages')
        $('.text-display').empty();
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
    } else if (channelSelected == false) {
        alert("You must select a channel to send a message in")
        return;
    }

    bot.channels.get(sendChannel).send(document.getElementById("message-text").value);
    document.getElementById("message-text").value = "";

})