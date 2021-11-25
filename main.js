const dotenv = require('dotenv');
dotenv.config(); 

const sqlite = require('sqlite3').verbose();

const {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: process.env.YT_AUTH
})

const { MessageEmbed } = require('discord.js');

var today = new Date();

var CronJob = require('cron').CronJob;

const moment = require('moment-timezone');

const Discord = require('discord.js'); 

const mongoose = require('mongoose');
const {talent, stream, user, membership, member_channel} = require('./data/models');

const { Client, Intents } = require('discord.js');

let Intss = new Discord.Intents(Discord.Intents.ALL);

const client = new Client({ws:{ intents: Intss,
partials: ['MESSAGE', 'GUILD_MEMBER', 'CHANNEL', 'USER', 'REACTION'] }});

const statusChange = require('./internals/status-change.js');

const streamHandler = require('./internals/stream-handler.js');

const talentHandler = require('./internals/talent-handler.js')

const messageHandler = require('./internals/message-handler.js')

const memberHandler = require('./internals/member-handler.js')

const talentSchema  = require('./data/models.js')

const memberRoles = require('./internals/member-roles.js')

const prefix = 'k!';

const fs = require('fs');
const { id } = require('date-fns/locale');

var cache = []

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.once('ready', async () =>{
    console.log('Online');
    await mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING || '', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        keepAlive: true
    }).then(console.log("Connected to mongodb"));
    cache = statusChange(client);

    var initialJob = new CronJob('0 */3 * * *', async function() {
        {
        /*console.log("I AM UPDATING STREAM TIMES NOW");
        var data = [];
        getYoutubeData(async function(err, data){
            if(err){
                console.log(err);
            } else {
                console.log("data array "+data);
                console.log(data[0].channel);
                console.log(data[2].ytid);
                console.log('LIVE TIMES OUTPUTTING');
                let db = new sqlite.Database('./db/database.db');
                db.run(`
                CREATE TABLE IF NOT EXISTS messages (
                    "id" INTEGER PRIMARY KEY,
                    "start_time" TEXT,
                    "video_title" TEXT,
                    "video_link" TEXT,
                    "start_date" TEXT
                )
                `);
                db.run(`DELETE FROM messages`);
                db.close();
            for (let index = 0; index < data.length; index++) {
                    await storeLiveTimes(data[index].ytid, data, index);  
            }
                await sleep(4000);
                await outputLiveTimes(data);
        

                console.log('LIVE TIMES OUTPUTTED');
            }
           });*/
        }
        await streamHandler.bupdate(client)
    }, null, true, 'America/New_York');

    memberRoles(client);
    //memberHandler.iterateCollectors();
    //setInterval(memberHandler.iterateCollectors, 1000 * 20);
    messageHandler.notify(client);
    setInterval(messageHandler.notify.bind(null, client), 1000 * 30);
    
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    console.log(reaction.message.id)
    member_channel.findOne({guildID: reaction.message.guildId}, async(err, res)=>{
        if(err) console.log(err)
        if(res.channelID==reaction.message.channel.id){
            if (reaction.emoji.name === '❌') {
                await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
            } else if (reaction.emoji.name === '✅'){
                await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership as valid.`)
                inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id)

            }
        }
    })
})
// client.on('messageReactionAdd', async (reaction, user) => {
//     if (reaction.message.partial) await reaction.message.fetch();
//     if (reaction.partial) await reaction.fetch();
//     if (user.partial) await user.fetch();
//     if (user.bot) return;
//     if (!reaction.message.guild) return;
//     console.log(reaction.message.id)
//     if('835727274107207711'==reaction.message.channel.id){
//                 if (reaction.emoji.name === '❌') {
//                     await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
//                 } else if (reaction.emoji.name === '✅'){
//                     await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership as valid.`)
//                     inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id)
    
//                 }
//             }
//     // member_channel.findOne({guildID: reaction.message.guildId}, async(err, res)=>{
//     //     if(err) console.log(err)
//     //     if(res.channelID==reaction.message.channel.id){
//     //         if (reaction.emoji.name === '❌') {
//     //             await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
//     //         } else if (reaction.emoji.name === '✅'){
//     //             await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership as valid.`)
//     //             inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id)

//     //         }
//     //     }
//     // })
// })

// client.on('raw', async(event) =>{
//     if (event.t === 'MESSAGE_REACTION_ADD'){
//         let reaction = event.d.emoji
//         let userID = event.d.user_id
//         let messageID = event.d.message_id
//         let guildID = event.d.guild_id
//         let channelID = event.d.channel_id
//         let guild = client.guilds.cache.get(guildID)
//         let channel = client.channels.cache.get(channelID)
//         let message = await channel.fetch(messageID)
//         let user = guild.members.cache.get(userID)
        
//         member_channel.findOne({guildID: guildID}, async(err, res)=>{
//         if(res.channelID == message.channel.id){
//         if (reaction.name === '❌') {
//             await message.channel.send(`<@&${message.author.id}>, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
//         } else if (reaction.name === '✅'){
//             await message.channel.send(`<@&${message.author.id}>, ${user.username} has marked your membership as valid.`)
//             inputMember(message, message.author.id, user.id)
//         }
//     }
//     })
       
//     }
// })

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(message.member.permissions.has("BAN_MEMBERS")){

    if(command === 'ping') {
        client.commands.get('ping').execute(message, args);
    }
    else if(command === 'setup') {
        client.commands.get('new setup').execute(message, args)
    }
    else if(command === 'clearsub') {
        talentHandler.deleteTalent(message, args)
    }
    else if(command === 'clearmsgs') {
        messageHandler.clearNotifications()
    }
    else if(command === 'bupdate') {
           streamHandler.bupdate(client, message)
        }
        
    
    else if(command === 'vchset') {
        memberHandler.subChannel(message, args)
    }
    else if(command === 'mrole') {
        memberHandler.subMemberRole(message, args)
    }
    //for now only for staff to debug
    else if(command === 'member'){
        memberHandler.callSub(message, args)
    }
}
    if (message.member.permissions.has("MENTION_EVERYONE")){
        if(command === 'timeset'){
            if(args.length==2){
                streamHandler.timeChange(message, args)
            } else {
                message.channel.send("ERR: Too many arguments")
            }
        }
        else if (command === 'displaysubs'){
            streamHandler.queryTalents(message, client)
        }
        else if (command === 'displaystreams'){
            streamHandler.displayStreams(message)
        }
    }
    if(message.member.roles.cache.has('835813294152744982')||message.member.permissions.has("BAN_MEMBERS")){

        if(command === 'seticon'){
            
            var image = message.attachments
            if(image.first()!=null){
            var link = image.first().url

            if(image.first().size<256000){

            if(message.member.roles.cache.has(args[0])&&message.member.roles.highest===message.member.roles.cache.get(args[0])){

                if(message.guild.me.roles.highest.comparePositionTo(message.member.roles.cache.get(args[0]))>0){

                    const role = message.guild.roles.cache.get(args[0])
                    role.setIcon(link)
                    message.channel.send("Role Icon Set")

                } else {
                    message.channel.send("Role is out of Kari's permission range.")
                }

            } else {
                message.channel.send("You do not have that role ID, or it was not your highest role.")
            }

        } else {
            message.channel.send("Image file size error (over 256kb).")
        }
    } else { message.channel.send("No file found.") }

        }
    }
    if(command === 'deeznuts'){
        message.channel.send("deez nuts")
        message.delete()
    }
    else if(command === 'help'){
        message.channel.send("__**Kari Commands**__\n\n"+

        "**Mod Commands**\n"+
        "*k!setup <talent name> <YouTube channel ID> <live channel id> <role id>* - subs talent to automatic updates\n"+
        "*k!clearmsgs* - clears all scheduled stream notifications\n"+
        "*k!bupdate* - forces an update to the bulletin\n"+
        "*k!clearsub <live channel id>* - clears a talent from live scheduling\n\n"+

        "**Tagger Commands**\n"+
        "*k!timeset <video ID> <minutes>* - manually adds minutes to a previously scheduled notification (to use if a stream is manually rescheduled)\n"+
        "*k!displaysubs* - displays current sub list\n"+
        "*k!displaystreams* - displays current upcoming notifications for streams and their rowID for timeset\n\n"+

        "**Booster Commands**\n"+
        "*k!seticon <role id>* - changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled)\n\n"+

        "**General Commands**\n"+
        "*k!help* - displays this\n"+
        "*k!ping* - pong\n"+
        "*k!deeznuts* - what do you think this does?")
    }
    
});





client.login(process.env.TOKEN);
