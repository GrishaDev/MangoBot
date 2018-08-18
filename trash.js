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

    // const channel = bot.guild.channels.find(ch => ch.name === 'general')
*/
