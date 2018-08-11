const http = require('http');
const path   = require('path');
const express = require('express');
const app = express();
var auth = require('./auth.json');
const https = require('https');
//var Discord = require('discord.io');
 const Discord = require("discord.js");
var answers = require ('./answers.json');
var people = require ('./people.json');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

//Ready for main branch

 const MAIN_CHANNEL = process.env.mainchannel;
 const GLEB_ID = process.env.glebid;

//const GLEB_ID = auth.glebid;
// var drole = process.env.drole; 
//var serverid = process.env.serverid; 
//const MAIN_CHANNEL = auth.mainchannel;

var general; 

//var serverid =auth.serverid; 

var bot = new Discord.Client({autoReconnect:true});
// {
//     token: auth.token,
//     autorun: true
//  });

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
    //console.log(bot.username);
    //console.log(bot.servers);
    //console.log(bot.channels);

    // const channel = bot.guild.channels.find(ch => ch.name === 'general')

    general = bot.channels.get(MAIN_CHANNEL);
    //general.send(`test`);

    bot.user.setActivity('dota 6', { type: 'PLAYING' });
    //console.log(JSON.stringify(bot.user));

    console.log(bot.user.username+' aka '+bot.user.id+' is online and ready!');
   // console.log(bot.guild.roles.find(role => role.name === "ew"))
    //console.log(path.resolve(__dirname, 'trash.mp3'));
});

bot.on('guildMemberAdd', function(member) 
{
    console.log("new member?");
    general.send("Hello there "+member.user.username);
    member.addRole(member.guild.roles.find(role => role.name === "human"));
});

//user, userID, status, game, event
bot.on('presenceUpdate', function(oldMember,newMember) 
{
    console.log(newMember.user.username+" is "+newMember.presence.status)
    if(newMember.user.id==GLEB_ID)
    {

        var msg;
        // if(status=="online" && previous!="idle")
        //     msg = '<@'+userID+'> aka GLEB IS HERE!!!!'
        // else 
        if(newMember.presence.status=="offline")
            msg="gleb left cri"
        
        general.send(msg);
    }
});
//function (user, userID, channelID, message, evt) 
bot.on('message', function (message) 
{
    if(message.author.bot) return;

    if (message.content.substring(0, 1) == '!') 
    {
        var args = message.content.substring(1).split(' ');
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
                message.channel.send('0MS i am so fast');
            break;
            case 'banana':
                message.channel.send('no bananas for you '+message.author);
            break;
            case 'help':
                message.channel.send('Figure out your self!');
            break;
            case 'dota':
                var found = false;

                for(var i=0; i<people.data.length;i++)
                {
                    if(people.data[i].name == cmd2)
                    {
                        console.log("Found "+cmd2);
                        found=true;
                        getLatestMatch(people.data[i].id,bot,message.channel)
                    }
                }
                if(!found)
                {
                    message.channel.send("I dont know this player! try !dotalist");
                }
            break;
            case 'dotalist':
                var all = []
                for(var i=0; i<people.data.length;i++)
                {
                    all.push(people.data[i].name);
                }

                message.channel.send(JSON.stringify(all));
            break;
            case 'say':
                general.send(final);
            break;
            case 'voice':
                if(!message.member.voiceChannel)
                {
                    message.channel.sendMessage("Join voice channel first.");
                    return;
                }
                if(!message.guild.voiceConnection)
                {
                    message.member.voiceChannel.join().then(function(connection)
                    {
                        play(connection,message,cmd2);
                    });
                }
            break;
            case 'dc':
                if(message.guild.voiceConnection)
                {
                    message.guild.voiceConnection.disconnect();
                }
            break;
         }
     }
     else
     {
        for(var i=0; i<answers.data.length; i++)
        {
            if(message.content.indexOf(answers.data[i].phrase) !== -1)
            {
                message.channel.send(answers.data[i].answer);
            }
        }
     }
});

function play(connection, message,url)
{
    const dispatcher = connection.playStream(ytdl(url,{filter:"audioonly"}));
    //const dispatcher = connection.playFile(path.resolve(__dirname, 'trash.mp3'));

    dispatcher.on("end",function()
    {
        connection.disconnect();
    });

    dispatcher.on('error', error => 
    {
        console.log(error)
    });
}

function getLatestMatch(playerid,bot,channel)
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
            channel.send(str);
        });
        
    }).on("error", (err) => {
        console.log("Error: " + err.message);
            channel.send("Error with dota api");
        });
}


bot.login(process.env.token);



/*

  // bot.setPresence({
    //     game: {
    //       name: 'dota 6',
    //       type: 0
    //     }
    // });


voice:
   // var VCID = bot.servers[serverid].members[userID].voice_channel_id;
                // if (!VCID) return;

                // bot.joinVoiceChannel(VCID, function(err, events) 
                // {
                //     if (err) return console.error(err);

                //     events.on('speaking', function(userID, SSRC, speakingBool) 
                //     {
                //         console.log("%s is " + (speakingBool ? "now speaking" : "done speaking"), userID );
                //     });

                //     bot.getAudioContext(VCID, function(error, stream) 
                //     {
                //         if (error) return console.error(error);

                //         // var vid;
                //         // try
                //         // {
                //         //     vid = ytdl('https://www.youtube.com/watch?v=UsnRQJxanVM&t',{filter: 'audioonly'});
                //         // }
                //         // catch(err)
                //         // {
                //         //     console.log("Bad youtube link or error getting it:: "+err);
                //         // }
                //         //var vid = makeAudio('https://www.youtube.com/watch?v=UsnRQJxanVM&t',stream);

                //         // fs.createReadStream(ytdl('https://www.youtube.com/watch?v=UsnRQJxanVM&t',{filter:"audioonly"})).pipe(stream, {end: false});
                    
                //         // stream.on('done', function() {
                //         //     console.log("done");
                //         // });
                //         // .pipe(fs.createWriteStream('video.flv'));

                //         var vid = path.resolve(__dirname, 'trash.mp3');
                //         fs.createReadStream(vid).pipe(stream, {end: false});
                    
                //         stream.on('done', function() {
                //            console.log("done");
                //         });
                //     });

                // });

dc:
                // var VCID = bot.servers[serverid].members[bot.id].voice_channel_id;

                // console.log(VCID);

                // if (!VCID) return;

                // bot.leaveVoiceChannel(VCID,function(err, events)
                // {
                //     if (err) return console.error(err);
                // });
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


function makeAudio(url,stream)
{
    var audioOutput = path.resolve(__dirname, 'sound.mp4');
    var mainOutput = path.resolve(__dirname, 'audio.mp3');

    console.log("starting to make file.. ");

    ytdl(url, { filter: format => {
        return format.container === 'm4a' && !format.encoding; } })
        // Write audio to file since ffmpeg supports only one input stream.
        .pipe(fs.createWriteStream(audioOutput))
        .on('finish', () => {
          ffmpeg()
            .input(ytdl(url, { filter: format => {
                return format.container === 'm4a' && !format.encoding; } }))
            .videoCodec('copy')
            .input(audioOutput)
            .audioCodec('copy')
            .save(mainOutput)
            .on('error', console.error)
            .on('progress', progress => {
              process.stdout.cursorTo(0);
              process.stdout.clearLine(1);
              process.stdout.write(progress.timemark);
            }).on('end', () => {
              fs.unlink(audioOutput, err => {
                if(err) console.error(err);
                else
                {
                    console.log('\nfinished downloading '+mainOutput);
                    // fs.createReadStream(mainOutput).pipe(stream, {end: false});
                    
                    // stream.on('done', function() {
                    //     console.log("done");
                    // });
                }
              });
            });
        });
    console.log("what am i doing here?");
}

// bot.on("disconnect", function() {
//     console.log(bot.user.username+' has disconnected.');
// 	//bot.connect()
// });

*/