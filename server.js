const http = require('http');
const express = require('express');
const app = express();
const https = require('https');
var Discord = require('discord.io');
var answers = require ('./answers.json')
var people = require ('./people.json')

// git test!!

const MAIN_CHANNEL = process.env.mainchannel;
const GLEB_ID = process.env.glebid;

var drole = process.env.drole; 
var serverid = process.env.serverid; 

var bot = new Discord.Client({
   token: process.env.token,
   autorun: true
});

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});

app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);


bot.on('ready', function (channelID,evt) 
{
    //console.log(bot.username);
    //console.log(bot.servers);
    //console.log(bot.channels);
    bot.setPresence({
        game: {
          name: 'dota 6',
          type: 0
        }
    });

    bot.sendMessage({
        to: MAIN_CHANNEL,
        message: "Mango bot restarted!"
    });
    console.log(bot.username+' aka '+bot.id+' is online and ready!');
});

bot.on('guildMemberAdd', function(callback) 
{
    console.log("new member?");
    bot.sendMessage({
    to: MAIN_CHANNEL,
    message: "Welcome new persona"
    });
});
bot.on('presence', function(user, userID, status, game, event) 
{
    console.log(user+" is "+status)
    if(userID==GLEB_ID)
    {

        var msg;
        // if(status=="online" && previous!="idle")
        //     msg = '<@'+userID+'> aka GLEB IS HERE!!!!'
        // else 
        if(status=="offline")
            msg="gleb left cri"
        
        bot.sendMessage({
            to: MAIN_CHANNEL,
            message: msg
        });
    }
});

bot.on('message', function (user, userID, channelID, message, evt) 
{
    if (message.substring(0, 1) == '!') 
    {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var cmd2 = args[1];

        var final="";

        for(var i=1; i<args.length; i++)
        {
            final+=args[i]+" ";
        }

        args = args.splice(1);

        switch(cmd) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: '0MS i am so fast'
                });
            break;
            case 'banana':
                bot.sendMessage({
                    to: channelID,
                    message: 'no bananas for you <@'+userID+'>'
                });
            break;
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Figure out your self!'
                });
            break;
            case 'dota':
                var found = false;

                for(var i=0; i<people.data.length;i++)
                {
                    if(people.data[i].name == cmd2)
                    {
                        console.log("Found "+cmd2);
                        found=true;
                        getLatestMatch(people.data[i].id,bot,channelID)
                    }
                }
                if(!found)
                {
                    bot.sendMessage({
                        to: channelID,
                        message: "I dont know this player! try !dotalist"
                    });
                }
            break;
            case 'dotalist':
                var all = []
                for(var i=0; i<people.data.length;i++)
                {
                    all.push(people.data[i].name);
                }
                bot.sendMessage({
                    to: channelID,
                    message: JSON.stringify(all)
                });
            break;
            case 'say':
                bot.sendMessage({
                    to: MAIN_CHANNEL,
                    message: final
                });
            break;
            case 'voice':
                var VCID = bot.servers[serverid].members[userID].voice_channel_id;
                if (!VCID) return;

                bot.joinVoiceChannel(VCID, function(err, events) 
                {
                    if (err) return console.error(err);

                    events.on('speaking', function(userID, SSRC, speakingBool) 
                    {
                        console.log("%s is " + (speakingBool ? "now speaking" : "done speaking"), userID );
                    });
                });
            break;
            case 'dc':
                var VCID = bot.voice_channel_id;

                console.log(VCID);
                console.log(JSON.stringify(bot));

                if (!VCID) return;

                bot.leaveVoiceChannel(VCID,function(err, events)
                {
                    if (err) return console.error(err);
                });
            break;
         }
     }
     else
     {
        for(var i=0; i<answers.data.length; i++)
        {
            if(message.indexOf(answers.data[i].phrase) !== -1 && user != bot.username)
            {
                bot.sendMessage({
                    to: channelID,
                    message: answers.data[i].answer
                });
            }
        }
     }
});

bot.on("disconnect", function() {
    console.log(bot.username+' has disconnected.');
	bot.connect()
});


function getLatestMatch(playerid,bot,channelID)
{
    https.get('https://api.opendota.com/api/players/'+playerid+'/recentMatches', (resp) => 
    {
        let data = '';
        resp.on('data', (chunk) => 
        {
            data += chunk;
        });
        resp.on('end', () => 
        {
            var match = JSON.parse(data)[0].match_id;
            var str = 'https://www.dotabuff.com/matches/'+match;
            bot.sendMessage({
                to: channelID,
                message: str
            });
        });
        
    }).on("error", (err) => {
        console.log("Error: " + err.message);
            bot.sendMessage({
                to: channelID,
                message: "Error with dota api"
            });
        });
}

async function voiceConnect(message)
{
    if (!message.guild) return;

    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) 
    {
        const connection = await message.member.voiceChannel.join();
    } else 
    {
        message.reply('You need to join a voice channel first!');
    }
}