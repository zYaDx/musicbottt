const { Client, RichEmbed } = require("discord.js");
const client = new Client({ disableEveryone: true})
const ytdl = require("ytdl-core");
const devs = ["" , "" , "" , "id"]
const request = require("request");
const convert = require("hh-mm-ss")
const fs = require("fs");
const getYouTubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const simpleytapi = require('simple-youtube-api')
const yt_api_key = "AIzaSyDoH9YxF0yi6ljyi2txYZHB10vXNUEP_2U"
const prefix = "m-";
client.login(process.env.SECERT_KEY);
var guilds = {};
/////////////////////////////////////////////////////////////////
client.on('error', (err) => console.log(err));
client.on('ready', () => console.log(`Launching...`))
/////////////////////////////////////////////////////////////////////////////////
 
client.on('message', async function(message) {
    if(message.author.bot) return;
    if(!message.channel.guild) return;
    //////////////////////////////////
    if(message.content === `<@${client.user.id}>`) return message.channel.send(`Hey I'am **${client.user.username}**, A nice music bot developed by: \`\`Abady#1196\`\``);
    // const noms = "** ❯ :musical_note: No music is playing, try ``m-play``" 
    const novc = "**<:MxNo:449703922190385153> | You are not in a voice channel.**"
    // const nomatch = "**<:MxNo:449703922190385153> You've to be in the same voice channel!**"
    const yt = "<:MxYT:451042476552355841>"
    const correct = client.guilds.get('448425456316973057').emojis.get("451040030635458574")
    const nope = client.guilds.get('448425456316973057').emojis.get('451040031277056001')
    // const member = message.member;
 
    if (message.content.startsWith(`${prefix}eval`)) {
        const eargs = message.content.split(" ").slice(1);
        if(!devs.includes(message.author.id)) return;
        const clean = text => {
            if (typeof(text) === "string")
              return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
          }
        try {
          const code = eargs.join(" ");
          let evaled = eval(code);
    
          if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);    
          message.channel.send(clean(evaled), {code:"xl"});
        } catch (err) {
          message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
      }
 
      if(message.content.startsWith(`${prefix}info`)) {
        function convertMS(ms) {
            var d, h, m, s;
            s = Math.floor(ms / 1000);
            m = Math.floor(s / 60);
            s = s % 60;
            h = Math.floor(m / 60);
            m = m % 60;
            d = Math.floor(h / 24);
            h = h % 24;
            return {
                d: d,
                h: h,
                m: m,
                s: s
            };
        };   
        let u = convertMS(client.uptime);
        let uptime = u.d + " days  , " + u.h + " hrs  , " + u.m + " mins  , " + u.s + " secs"
        message.channel.send(new RichEmbed() 
        .setAuthor(client.user.username,client.user.avatarURL)
        .setURL("https://abayro.xyz")
        .addField("Version", "1.0v", true)
        .addField("Library", "[discordjs](https://www.npmjs.com/search?q=discord.js)", true)
        .addField("Creator", "Abady", true)
        .addField("Users", `${client.users.size}`, true)
        .addField('RAM Usage',`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,true)     
        .addField("Website", "No website atm", true)
        .setFooter("Uptime "+`${uptime}`)
        .setColor("RANDOM")
    )
      }
    
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(" ");
    const youtube = new simpleytapi(yt_api_key);
 
    if (!guilds[message.guild.id]) {
        guilds[message.guild.id] = {
            queue: [],
            queueNames: [],
            isPlaying: false,
            dispatcher: null,
            voiceChannel: null,
            volume: 1,
            skipReq: 0,
            skippers: [],
            loop: false
        };
    }
 
    function clear() { 
        guilds[message.guild.id].queue = [];
        guilds[message.guild.id].queueNames = [];
        guilds[message.guild.id].isPlaying = false;
        guilds[message.guild.id].dispatcher = null
        guilds[message.guild.id].voiceChannel = null;
        guilds[message.guild.id].skipReq = 0;
        guilds[message.guild.id].skipReq = [];
        guilds[message.guild.id].loop = false;
        guilds[message.guild.id].volume = 1 ;
    }
 
 
    if (mess.startsWith(prefix + "play") || mess.startsWith(prefix+"شغل")) {
        if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
        const voiceChannel = message.member.voiceChannel
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT')) return message.channel.send({embed: {description: "🛑 I don't have permission to CONNECT! Give me some."}});
        if (!permissions.has('SPEAK')) return message.channel.send({embed: {description: "🛑 I don't have permission to SPEAK! Give me some."}});
         if (args.length == 0 || !args) return message.channel.send(`:musical_note: ❯ m-play **Youtube URL / Search**`)
            if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
                if(guilds[message.guild.id].queue.length > 100) return message.channel.send(``, {embed: {
                    description: `🔒 Sorry, max queue length is 100, do **${prefix}clear** to clear entire queue or **${prefix}clear <number>** to clear 1 item`
                }})
                if (args.match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)) {
                    const playlist = await youtube.getPlaylist(args);
                    const videos = await playlist.getVideos();
                    const queuesync = 100 - guilds[message.guild.id].queue.length
                    if(queuesync < 0 || queuesync == 0) return message.channel.send(`:x: Cannot add this playlist, **\`\`MAX_QUEUE = 100\`\`** clear the current queue and try again!`)
                    videos.slice(0, queuesync).forEach(video => {
                        guilds[message.guild.id].isPlaying = true;
                        guilds[message.guild.id].queueNames.push(video.title)
                        guilds[message.guild.id].queue.push(video.id)
                    })
                    return message.channel.send(`[:musical_score: __${playlist.title}__] **${queuesync}** items Added to the **Queue**!`)                    ;
                }
                message.channel.send(`**${yt} Searching :mag_right: \`\`${args}\`\`**`).then(()=> {
                getID(args, function(id) {
                   fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        if(videoInfo.duration > 1800) return message.channel.send(`**${message.author.username}, :x: Cannot play a video that's longer than 30 minutes**`).then(message.react(nope));
                        else message.react(correct)
                        add_to_queue(id, message);
                        message.channel.send(new RichEmbed()
                        .setAuthor("Added to queue", message.author.avatarURL)
                        .setTitle(videoInfo.title)      
                        .setURL(videoInfo.url)
                        .addField("Channel", videoInfo.owner, true)
                        .addField("Duration", convert.fromS(videoInfo.duration, 'mm:ss') , true)
                        .addField("Published at", videoInfo.datePublished, true)
                        .addField("Postion in queue", guilds[message.guild.id].queueNames.length, true)
                        .setColor("RED")
                        .setThumbnail(videoInfo.thumbnailUrl)
                        )
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                    });
                })
            })
            } else {
                if (args.match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)) {
                    const playlist = await youtube.getPlaylist(args);
                    const videos = await playlist.getVideos();
                    playMusic(videos[0].id, message)
                    guilds[message.guild.id].queueNames.push(videos[0].title)
                    guilds[message.guild.id].queue.push(videos[0].id)
                    videos.slice(1, 100).forEach(video => {
                        guilds[message.guild.id].isPlaying = true;
                        guilds[message.guild.id].queueNames.push(video.title)
                        guilds[message.guild.id].queue.push(video.id)
                    })
                    return message.channel.send(`[:musical_score: __${playlist.title}__] **${videos.slice(0, 100).length}** items Added to the **Queue**!\n**Playing :notes: \`\`${videos[0].title}\`\` - Now!**`)                    ;
                }
                message.channel.send(`${yt} **Searching :mag_right: \`\`${args}\`\` **`).then(() => {
                getID(args, function(id) {
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        if(videoInfo.duration > 1800) return message.channel.send(`**${message.author.username}, :x: Cannot play a video that's longer than 30 minutes**`).then(message.react(nope))
                        else message.react(correct)
                        playMusic(id, message);
                        guilds[message.guild.id].isPlaying = true;
                        guilds[message.guild.id].queue.push(id);
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                        message.channel.send(`**Playing :notes: \`\`${videoInfo.title}\`\` - Now!**`);
                    });
                })})
            }
        } else {
            message.reply(novc);
        }
 
    } else if (mess.startsWith(prefix + "skip") || mess.startsWith(prefix+"عدي")) {
        if(!message.member.voiceChannel) return message.reply(novc)
        if(message.member.hasPermission('MANAGE_CHANNELS')) {
        if (guilds[message.guild.id].queueNames[0]) {
            message.channel.send(`**:fast_forward: Skipped** ${guilds[message.guild.id].queueNames[0]}`);
            return skip_song(message);
        } else return message.channel.send(`**:x: Nothing playing in this server**`);
        }
        else
        if (guilds[message.guild.id].skippers.indexOf(message.author.id) === -1) {
            guilds[message.guild.id].skippers.push(message.author.id);
            guilds[message.guild.id].skipReq++;
            if (guilds[message.guild.id].skipReq >= Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
                if (guilds[message.guild.id].queueNames[0]) {
                message.channel.send(`**:fast_forward: Skipped** ${guilds[message.guild.id].queueNames[0]}`);
                skip_song(message);
                } else return message.channel.send(`**:x: Nothing playing in this server**`);
            } else {
                message.channel.send(`**:point_up::skin-tone-1: ${message.author.username} has vote to skip current song! **` + Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) - guilds[message.guild.id].skipReq) + "**  more votes to skip! **";
            }
        } else {
            message.reply("<:MxNo:449703922190385153> you already voted to skip!");
        }
 
    } else if (mess.startsWith(prefix + "queue") || mess.startsWith(prefix+"قائمة")) {
        if(guilds[message.guild.id].queueNames.length < 1) return message.channel.send(`**:x: Nothing playing in this server**`);
        if(!guilds[message.guild.id].queueNames[1]) return message.channel.send('', {embed: {
        description: `__Now Playing:__\n**[${guilds[message.guild.id].queueNames[0]}](https://www.youtube.com/watch?v=${guilds[message.guild.id].queue[0]})**`,
        author: {
        name: `${message.guild.name}'s Queue.`,
        icon_url: message.guild.iconURL
        },
        color: 3447003
        }});
        else {
            let x;
            if(args > 1) {
             x = Math.floor(args)*10+1
            } else {
              x = Math.floor(11)
            }
            let i;
            if(args > 1) {
                i = x-11
               } else {
                 i = 0
               }
            let queuelist = guilds[message.guild.id].queueNames.slice(x-10,x).map(song => `**\`\`${++i}.\`\`** [${song}](https://www.youtube.com/watch?v=${guilds[message.guild.id].queue[i]})`).join('\n\n')
            if(!queuelist) return message.channel.send(`<:MxNo:449703922190385153> | Page doesn't exist!`)
            return message.channel.send('', {embed: {
                description: `__Now Playing:__\n**[${guilds[message.guild.id].queueNames[0]}](https://www.youtube.com/watch?v=${guilds[message.guild.id].queue[0]})**\n\n:arrow_down: __Up Next__  :arrow_down:\n\n${queuelist}\n\n**Total items in queue: ${guilds[message.guild.id].queueNames.length} | Page ${Math.floor(x/10)} of ${Math.floor((guilds[message.guild.id].queue.slice(1).length+10) /10)}**`,
                thumbnail: {url: "https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png"} , 
                author: {
                    name: `${message.guild.name}'s Queue.`,
                    icon_url: message.guild.iconURL
                    },
                color: 3447003
            }}) 
        }
    }
 
if(mess.startsWith(prefix+"np")) {
    const short = require('short-number');
    if(!guilds[message.guild.id].queue[0] || !guilds[message.guild.id].isPlaying) return message.channel.send(`**:x: Nothing playing in this server.**`)
    await message.channel.startTyping()
    await fetchVideoInfo(guilds[message.guild.id].queue[0], function(err, videoInfo) {
                        if (err) throw new Error(err);
                        message.channel.stopTyping(true);
                        message.channel.send(new RichEmbed()
                        .setTitle(videoInfo.title)      
                        .setURL(videoInfo.url)
                        .addField("Channel", `[**${videoInfo.owner}**](https://youtube.com/channel/${videoInfo.channelId})`, true)
                        .addField("Duration", `${convert.fromS(videoInfo.duration, 'mm:ss')} — [**Download MP3**](https://www.flvto.biz/sa/downloads/mp3/yt_${videoInfo.videoId})`, true)
                        .addField("Views", short(videoInfo.views), true)
                        .addField("Likes/Dislikes", `👍 **${short(videoInfo.likeCount)}** / 👎 **${short(videoInfo.dislikeCount)}**`, true)
                        .setColor("RED")
                        .setImage(videoInfo.thumbnailUrl)
                        )
    })
}
 
if(mess.startsWith(prefix+"stop") || mess.startsWith(prefix+"اطلع")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if(guilds[message.guild.id].isPlaying) guilds[message.guild.id].dispatcher.end();
    if (guilds[message.guild.id].voiceChannel)
    { 
    await clear()
    message.guild.voiceConnection.disconnect();
    message.channel.send(`**:mailbox_with_no_mail: Successfully disconnected!**`)
    }
}
 
if(mess.startsWith(prefix+"stfu") || message.content.startsWith(`<@${client.user.id}> stfu`)) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if(guilds[message.guild.id].isPlaying) guilds[message.guild.id].dispatcher.end();
    if (guilds[message.guild.id].voiceChannel)
    { 
    await clear()
    message.guild.voiceConnection.disconnect();
    message.channel.send(`:cry: k sempai!`)
    }
}
 
if(message.content.startsWith(prefix+"search")) {
    let index = 0
    if(!args) return message.channel.send(`**${prefix}search [song name]**`)
    const videos = await youtube.searchVideos(args, 10)
    message.channel.send(`**<:MxYT:451042476552355841> Search Results for \`\`${args}\`\`**`,{embed: {
    description: videos.map(song =>`**[${++index}]** [${song.title}](${song.url})`).join('\n'),
    author: {
    icon_url: message.author.avatarURL,
    name: `${message.author.username} (${message.author.id})`  
    },
    footer: {
        text: `Type a num between 1 and ${videos.length}, type cancel to cancel.`,
    }
    }})
try {
var response = await message.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11 || msg2.content === 'cancel' && msg2.author.id === message.author.id, {
    maxMatches: 1,
    time: 30000,
    errors: ['time'],
});
} catch (error) {
return message.channel.send(`**:x: Timeout**`) 
}
if(guilds[message.guild.id].queue.length > 100) return message.channel.send(``, {embed: {
    description: `🔒 Sorry, max queue length is 100, do **${prefix}clear** to clear entire queue or **${prefix}clear <number>** to clear 1 item`
}})
if(response.first().content === 'cancel') return message.channel.send(`**Cancelled it for yah :wink:**`)
const videoIndex = parseInt(response.first().content)
const voiceChannel = message.member.voiceChannel
const permissions = voiceChannel.permissionsFor(message.client.user)
if (!permissions.has('CONNECT')) return message.channel.send({embed: {description: "🛑 I don't have permission to CONNECT! Give me some."}});
if (!permissions.has('SPEAK')) return message.channel.send({embed: {description: "🛑 I don't have permission to SPEAK! Give me some."}});    
const id = videos[videoIndex - 1].id;
message.delete();
if(!guilds[message.guild.id].queue[0] || !guilds[message.guild.id].isPlaying) {
fetchVideoInfo(id, function(err, videoInfo) {
if (err) throw new Error(err);
if(videoInfo.duration > 1800) return message.channel.send(`**${message.author.username}, :x: Cannot play a video that's longer than 30 minutes**`).then(message.react(nope));
else message.react(correct)
playMusic(id, message);
guilds[message.guild.id].isPlaying = true;
guilds[message.guild.id].queue.push(id);
guilds[message.guild.id].queueNames.push(videos[videoIndex - 1].title);
message.channel.send(`**Playing :notes: \`\`${videos[videoIndex - 1].title}\`\` - Now!**`);
});
} else {
        fetchVideoInfo(`${id}`, function(err, videoInfo) {
            if (err) throw new Error(err);
            if(videoInfo.duration > 1800) return message.channel.send(`**${message.author.username}, :x: Cannot play a video that's longer than 30 minutes**`).then(message.react(nope));
            else message.react(correct)
            add_to_queue(id, message);
            message.channel.send(new RichEmbed()
            .setAuthor("Added to queue", message.author.avatarURL)
            .setTitle(videoInfo.title)
            .setURL(videoInfo.url)
            .addField("Channel", videoInfo.owner, true)
            .addField("Duration", convert.fromS(videoInfo.duration, 'mm:ss') , true)
            .addField("Published at", videoInfo.datePublished, true)
            .addField("Postion in queue", guilds[message.guild.id].queueNames.length, true)
            .setColor("RED")
            .setThumbnail(videoInfo.thumbnailUrl)
            )
            guilds[message.guild.id].queueNames.push(videoInfo.title);
        });
}
    }
 
 
else if (message.content.startsWith(prefix + 'vol') || mess.startsWith(prefix+"صوت")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if (!guilds[message.guild.id].isPlaying) return message.channel.send("**:x: Nothing playing in this server**")
    if(!args) return message.channel.send(`**:loud_sound: Current Volume:** ${guilds[message.guild.id].dispatcher.volume*100}`)
    if(isNaN(args)) return message.channel.send(`**:x: Volume must be a number -_-**`)
    if (args > 200) return message.reply('**:headphones: For some health reasons the max vol you can use is ``200``, kthx**');
    if (args < 1) return message.reply("**:headphones: you can set volume from ``1`` to ``200``**");
    guilds[message.guild.id].dispatcher.setVolume((0.01 * parseInt(args)))
    guilds[message.guild.id].volume = 0.01 * parseInt(args)
    message.channel.send(`**:loud_sound: Volume:** ${guilds[message.guild.id].dispatcher.volume*100}`);
}
 
 
else if (mess.startsWith(prefix + 'pause') || mess.startsWith(prefix+"وقف")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if (guilds[message.guild.id].dispatcher.paused === true) return message.channel.send("*:hash: Already paused*")
    message.channel.send(':pause_button: **Paused**').then(() => {
        guilds[message.guild.id].dispatcher.pause();
    });
}
 
else if (mess.startsWith(prefix + 'resume') || mess.startsWith(prefix+"كمل")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if (guilds[message.guild.id].dispatcher.paused === false) return message.channel.send("*:hash: Nothing to resume.*")
    message.channel.send(':play_pause: **Resuming**').then(() => {
        guilds[message.guild.id].dispatcher.resume();
    });
}
 
 
// ONE ITEM WORKS, BUT QUEUE NO... ==> QUEUE LOOP SYSTEM IN 2.0
 
else if (mess.startsWith(prefix + 'loop') || mess.startsWith(prefix+"عيد")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if (!guilds[message.guild.id].isPlaying) return message.channel.send("**:x: Nothing playing in this server**")
    if(guilds[message.guild.id].loop === true) {
        message.channel.send(`:arrow_right_hook: **Looping Disabled**`)
        guilds[message.guild.id].loop = false;        
        return;
    } else if(guilds[message.guild.id].loop === false) {
    guilds[message.guild.id].loop = true;
    message.channel.send(':repeat_one: **Looping Enabled!**')
    return;
    }
}
 
 
else if (mess.startsWith(prefix + 'join') || mess.startsWith(prefix+"ادخل")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if(!guilds[message.guild.id].isPlaying && guilds[message.guild.id].queueNames.length <= 0) {
        message.member.voiceChannel.join().then(message.react(correct));
        message.channel.send(`**:page_facing_up: Queue moved to \`\`${message.member.voiceChannel.name}\`\`**`)
    } else {
        message.channel.send(`<:MxNo:449703922190385153> **Music is being played in another voice channel!**`)
    }
}
 
else if (mess.startsWith(prefix + 'clear') || mess.startsWith(prefix+"نظف")) {
    if (!message.member.voiceChannel) return message.reply(novc);
    if(!guilds[message.guild.id].queueNames[0] || !guilds[message.guild.id].isPlaying) return message.channel.send(`**:x: Nothing playing in this server**`)
   if(guilds[message.guild.id].queueNames.length > 1) {
    if(!args || isNaN(args) && args != 0) {
    guilds[message.guild.id].queueNames.splice(1, guilds[message.guild.id].queueNames.length)
    guilds[message.guild.id].queue.splice(1, guilds[message.guild.id].queue.length)
    message.channel.send(`:asterisk: Cleared the queue of **${message.guild.name}**`)
    } else if(args > 0) {
        const removedsong = guilds[message.guild.id].queueNames[parseInt(args)]
        if(!removedsong) return message.channel.send(`:x: **No such item, or item doesn't exist!**`)
        guilds[message.guild.id].queueNames.splice(parseInt(args), 1)
        guilds[message.guild.id].queue.splice(parseInt(args), 1)
        return message.channel.send(`:wastebasket: Removed **${removedsong}** from the queue.`);}
   } else if(guilds[message.guild.id].queueNames.length <= 1 ) {
       message.channel.send(`<:MxNo:449703922190385153> There's only 1 item in the queue. use \`\`${prefix}skip\`\` instead! `)
   }
}
});
 
 
 
//
function skip_song(message) {
    guilds[message.guild.id].dispatcher.end();
}
 
//ERROR: Playing 1 item over and over.
async function playMusic(id, message) {
    guilds[message.guild.id].voiceChannel = message.member.voiceChannel;
    guilds[message.guild.id].voiceChannel.join().then(function(connection) {
        stream = ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly',
            quality: 'highestaudio',
            audioEncoding: "opus"
        });
        guilds[message.guild.id].skipReq = 0;
        guilds[message.guild.id].skippers = [];
        guilds[message.guild.id].dispatcher = connection.playStream(stream, {bitrate: "auto", volume: guilds[message.guild.id].volume});
        guilds[message.guild.id].dispatcher.on('end', async function() {
            guilds[message.guild.id].skipReq = 0;
            guilds[message.guild.id].skippers = [];
           if(guilds[message.guild.id].loop === true) return playMusic(guilds[message.guild.id].queue[0], message)
           else                      
           await guilds[message.guild.id].queue.shift();
           await guilds[message.guild.id].queueNames.shift();
            if (guilds[message.guild.id].queue.length === 0) {
                guilds[message.guild.id].queue = [];          
                guilds[message.guild.id].queueNames = [];
                guilds[message.guild.id].isPlaying = false;
                setTimeout(function() {
                if(guilds[message.guild.id].voiceChannel !== null) return message.channel.send(`**:stop_button: Queue concluded.**`)
            }, 1000)
            } else {
                setTimeout(async function() {
                    if(!guilds[message.guild.id].queueNames || guilds[message.guild.id].queueNames[0] == undefined) return;
                    await playMusic(guilds[message.guild.id].queue[0], message);
                   message.channel.send(`**Playing :notes: \`\`${guilds[message.guild.id].queueNames[0]}\`\` - Now!**`)
                }, 500);
            }
        });
    });
}
 
 
 
function getID(str, cb) {
    if (isYoutube(str)) {
         cb(getYouTubeID(str));
    } else {
        search_video(str, function(id) {
            cb(id);
        });
    }
}
 
function add_to_queue(strID, message) {
    if (isYoutube(strID)) {
        guilds[message.guild.id].queue.push(getYouTubeID(strID));
    } else {
        guilds[message.guild.id].queue.push(strID);
    }
}
 
function search_video(query, callback) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
        var json = JSON.parse(body);
        if (!json.items[0]) callback("3_-a9nVZYjk");
        else {
            callback(json.items[0].id.videoId);
        }
    });
}
 
function isYoutube(str) {
    return str.toLowerCase().indexOf("youtube.com") > -1 || str.toLowerCase().indexOf("youtu.be") > -1;
}
