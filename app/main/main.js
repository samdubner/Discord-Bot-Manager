// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const Discord = require('discord.js');
const bot = new Discord.Client();

var online = false;

$("#start").click(function () {
    if (online == false) {
        bot.login("Mjg0MTI0ODQzMjY2NDA4NDU5.C__ZAg.NKPzEZZ-OZveAlXncmWxmIuDD_8");
        online = true;
    } else {
        alert("The bot is already on");
    }
    return;
})

$("#stop").click(function () {
    if(online == true) {
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