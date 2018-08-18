const Discord = require("discord.js");
var answers = require ('../jsons/answers.json');
var memes = require ('../jsons/memes.json');
var people = require ('../jsons/people.json');
const https = require('https');
const ytdl = require('ytdl-core');

module.exports = 
{
    ready: ready,
    newMember: newMember,
    presenceChange: presenceChange,
    message: message
};


const VOLUME = 0.3;
var general; 
var playlist = [];
const GLEB_ID = process.env.glebid;
var dispatcher;

function ready(MAIN_CHANNEL,bot)
{
    general = bot.channels.get(MAIN_CHANNEL);
    bot.user.setActivity('dota 6', { type: 'PLAYING' });
    console.log(bot.user.username+' aka '+bot.user.id+' is online and ready!');
}

function newMember(member)
{
    console.log("new member?");
    general.send("Hello there "+member.user.username);
    member.addRole(member.guild.roles.find(role => role.name === "human"));
}

function presenceChange(oldMember,newMember)
{
    console.log(newMember.user.username+" is "+newMember.presence.status)
    if(newMember.user.id==GLEB_ID)
    {
        var msg;
        if(oldMember.presence.status=="offline" && newMember.presence.status=="online")
            msg = newmember.user+' aka GLEB IS HERE!!!!'
        else if(newMember.presence.status=="offline")
            msg="gleb left cri"
        
        general.send(msg);
    }
}

function message(message)
{
    console.log(message.author.username+" sent a message.");
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
                coolMessage("Help",0xFF0000,"Figure out your self!",message.channel);
            break;
            case 'dota':
                var found = false;

                for(var i=0; i<people.data.length;i++)
                {
                    if(people.data[i].name == cmd2)
                    {
                        console.log("Found "+cmd2);
                        found=true;
                        getLatestMatch(people.data[i].id,message.channel)
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
                coolMessage("Known dota players:",0xFF0000,JSON.stringify(all),message.channel);
            break;
            case 'say':
                if(final)
                    general.send(final);
            break;
            case 'play':
                if(!message.member.voiceChannel)
                {
                    message.channel.send("Join voice channel first.");
                    return;
                }
                if(!cmd2)
                {
                    message.channel.send("Go away!");
                    return;
                }
                if(!ytdl.validateURL(cmd2))
                {
                    message.channel.send("Not a youtube link!");
                    return;
                }
                if(!message.guild.voiceConnection)
                {
                    playlist.push(cmd2);
                    message.member.voiceChannel.join().then(function(connection)
                    {
                        play(connection,message);
                    });
                }
                else
                {
                    ytdl.getInfo(cmd2, function(err, info) {
                        console.log("Playing "+info.title);
                        coolMessage("Youtube:",0xFF0000,"added to playlist "+info.title,message.channel);
                    });
                    playlist.push(cmd2);
                }
            break;
            case 'meme':
                if(!message.member.voiceChannel)
                {
                    message.channel.send("Join voice channel first.");
                    return;
                }
                var found = false;
                if(!message.guild.voiceConnection)
                {
                    for(var i=0; i<memes.data.length; i++)
                    {
                        if(memes.data[i].phrase == cmd2)
                        {
                            console.log("Found "+cmd2);
                            found=true;
                            var link = memes.data[i].url;
                            console.log("Gona play "+link);

                            playlist.push(link);
                            message.member.voiceChannel.join().then(function(connection)
                            {
                                play(connection,message);
                            });
                        }
                    }
                    if(!found)
                    {
                        message.channel.send("I dont know this meme! try !memelist");
                    }
                }
                else
                {
                    message.channel.send("First hear or stop the playlist, then play memes!");
                }
            break;
            case 'memelist':
                var all = []
                for(var i=0; i<memes.data.length;i++)
                {
                    all.push(memes.data[i].phrase);
                }
                coolMessage("Known memes:",0xFF0000,JSON.stringify(all),message.channel);
            break;
            case 'stop':
                if(message.guild.voiceConnection)
                {
                    playlist = [];
                    message.guild.voiceConnection.disconnect();
                    if(dispatcher)
                        dispatcher.end();
                }
            break;
            case 'skip':
                if(message.guild.voiceConnection)
                {
                    if(dispatcher)
                        dispatcher.end();
                }
            break;
         }
     }
     else
     {
        for(var i=0; i<answers.data.length; i++)
        {
            if(message.content.toLowerCase().indexOf(answers.data[i].phrase) !== -1)
            {
                message.channel.send(answers.data[i].answer);
            }
        }
     }
}






function coolMessage(title,color,desc,channel)
{
    const embed = new Discord.RichEmbed()
    .setTitle(title)
    .setColor(color)
    .setDescription(desc);

    channel.send(embed);
}

function play(connection, message)
{
    ytdl.getInfo(playlist[0], function(err, info) {
        console.log("Playing "+info.title);
        coolMessage("Youtube:",0xFF0000,"Playing "+info.title,message.channel);
    });

    dispatcher = connection.playStream(ytdl(playlist[0],{filter:"audioonly"}));
    dispatcher.setVolume(VOLUME);

    playlist.shift();

    dispatcher.on("end",function()
    {
        console.log("Done playing");
        if(playlist[0])
            play(connection,message);
        else
            connection.disconnect();
    });

    dispatcher.on('error', error => 
    {
        console.log("Error playing:: "+error);
    });
}

function getLatestMatch(playerid,channel)
{
    console.log("Getting dotabuff of "+playerid);
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