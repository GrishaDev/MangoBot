const path   = require('path');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const http = require('http');
const Discord = require("discord.js");
var methods = require('./logic/methods.js');

//var auth = require('./auth.json');

const app = express();

//staging

//Main 
const MAIN_CHANNEL = process.env.mainchannel;

//Staging
//const MAIN_CHANNEL = auth.mainchannel;

var bot = new Discord.Client({autoReconnect:true});

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});

app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);


bot.on('ready', function () 
{
    methods.ready(MAIN_CHANNEL,bot);
});

bot.on('guildMemberAdd', function(member) 
{
    methods.newMember(member)
});

bot.on('presenceUpdate', function(oldMember,newMember) 
{
    methods.presenceChange(oldMember,newMember);
});

bot.on('message', function (message) 
{
    methods.message(message);
});


bot.login(process.env.token);
//bot.login(auth.token);
