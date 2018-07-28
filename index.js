var Discord = require('discord.io');
var auth = require('./auth.json');
var answers = require ('./answers.json')
var people = require ('./people.json')
const https = require('https');

const MAIN_CHANNEL = auth.mainchannel;
const GLEB_ID = auth.glebid;

var drole = auth.drole; 
var serverid = auth.serverid; 

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});


bot.on('ready', function (channelID,evt) 
{
    console.log(bot.serverid);
    bot.setPresence({
        game: {
          name: 'dota 6',
          type: 0
        }
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
        if(status=="online")
            msg = '<@'+user+'> aka GLEB IS HERE!!!!'
        else
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

// trash
    // if(callback.guild_id == serverid)
    //     bot.addToRole({"serverID":serverid,"userID":callback.id,"roleID":drole},function(err,response) 
    //     {
    //         console.log(response);
    //         console.log("assigned to lowmmr rank!");
    //         bot.sendMessage({
    //             to: MAIN_CHANNEL,
    //             message: "Welcome "+callback.user
    //         });
    //         if (err) console.error(err);
    //             console.log("error cri");
    //     });
 // -- other trash
    // else
    // {
    //     var msg;
    //     if(status=="online")
    //         msg = "Hello there "+user
    //     else
    //         msg="bye bye "+user
        
    //     bot.sendMessage({
    //         to: MAIN_CHANNEL,
    //         message: msg
    //     });
    // }