const dotenv = require('dotenv');
dotenv.config(); 

// const sqlite = require('sqlite3').verbose();

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

// const sc = require('./internals/scrape.js')

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

//  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, 
//      Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
//      Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT],
//  partials: ['MESSAGE', 'GUILD_MEMBER', 'CHANNEL', 'USER', 'REACTION'] });

 const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, 
     GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences, 
     GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
 partials: ['MESSAGE', 'GUILD_MEMBER', 'CHANNEL', 'USER', 'REACTION'] });
const statusChange = require('./internals/status-change.js');

const streamHandler = require('./internals/stream-handler.js');

const talentHandler = require('./internals/talent-handler.js')

const messageHandler = require('./internals/message-handler.js')

const memberHandler = require('./internals/member-handler.js')

const guildHandler = require('./internals/guild-handler.js')

const random = require('./internals/random.js')

const models = require('./data/models.js')

const memberRoles = require('./internals/member-roles.js')

const dm = require('./internals/dm-handler.js')

const twitterHandler = require('./internals/twitter-handler.js')

const Twitter = require('twitter-v2');

const twitterClient = new Twitter({
    bearer_token: process.env.BEARER_TOKEN,
});

const prefix = 'k!';

const fs = require('fs');
const { id } = require('date-fns/locale');
let startArr = []
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
    //let d = await sc.build()
    statusChange(client, startArr, twitterClient);
    // setInterval(statusChange.bind(null, client), 1000 * 2);
    new CronJob('0 */3 * * *', async function() {
        await streamHandler.bupdate(client, true)
    }, null, true, 'America/New_York');
    new CronJob('*/5 * * * *', async function() {
        await streamHandler.bupdate(client, false)
    }, null, true, 'America/New_York');
    new CronJob('* */3 * * *', async function() {
        for await(const guild of models.guild.find({boardChannelID: {$exists: true}})){
            if(guild.guildID!='835723287714857031'){
                streamHandler.publicBoard(client, guild, true)
            }
        }
    }, null, true, 'America/New_York');
    new CronJob('*/5 * * * *', async function() {
        for await(const guild of models.guild.find({boardChannelID: {$exists: true}})){
            if(guild.guildID!='835723287714857031'){
                streamHandler.publicBoard(client, guild, false)
            }
        }
    }, null, true, 'America/New_York');
    dm(client, prefix)
    random.kari(client)
    memberRoles(client, prefix);
    messageHandler.notify(client);
    setInterval(messageHandler.notify.bind(null, client), 1000 * 30);
    
});

client.on('messageCreate', async(message) =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    if(message.guild==null) return;
    if(message.partial) await message.fetch();
    if(message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(message.member.permissions.has(PermissionsBitField.Flags.Administrator)){

    if(command === 'guildsetup'){
        guildHandler.setupGuild(message, args)
    }
    }
    if(message.member.permissions.has(PermissionsBitField.Flags.BanMembers)){

    if(command === 'setup') {
        talentHandler.mainSetup(message, twitterClient)
    }
    else if(command === 'clearsub') {
        talentHandler.deleteTalent(message, args)
    }
    else if(command === 'clearmsgs') {
        messageHandler.clearNotifications()
    }
    else if(command === 'boardset'){
        guildHandler.boardSet(message, args)
    }
    else if(command === 'board'){
        if(message.guild.id!='835723287714857031'){
            let guild = await models.guild.findOne({guildID: message.guild.id})
            streamHandler.publicBoard(client, guild)
        }
    }
    else if(command === 'vchset') {
        memberHandler.subChannel(message, args)
    }
    else if(command === 'mrole'||command === 'mr') {
        memberHandler.subMemberRole(message, args)
    }
    else if(command === 'mrclear'||command === 'mroleclear'){
        memberHandler.changeMemberRole(message, args)
    }
    else if(command === 'mremove'){
        memberHandler.manualMembershipRemove(message, args, client)
    }
    else if(command === 'mtlist'){
        memberHandler.talentMembers(message, args)
    }
    else if(command === 'mtalentsetup'){
        memberHandler.subMembershipTalent(message, args)
    }
    else if(command === 'brole'){
        guildHandler.boosterRoleSet(message, args)
    }
    else if(command === 'tset'){
        twitterHandler.addTwitter(twitterClient, message, args)
    }
    else if (command === 'displaysubs'){
        streamHandler.queryTalents(message, client)
    }

}
    if (message.member.permissions.has(PermissionsBitField.Flags.MentionEveryone)){
        // if(command === 'timeset'){
        //     if(args.length==2){
        //         streamHandler.timeChange(message, args)
        //     } else {
        //         message.channel.send("ERR: Too many arguments")
        //     }
        // }
        // else if (command === 'displaystreams'){
        //     streamHandler.displayStreams(message)
        // }
    }


    if(command === 'seticon'){
        guildHandler.setIcon(message, args)
    }
    else if(command === 'ping') {
        await message.channel.send("pong")
    }
    else if (command === 'live'){
        
        streamHandler.displayLive(message)
    }
    else if(command === 'deeznuts'){
        message.channel.send("deez nuts")
        message.delete()
    }
    else if(command === 'member'){
        memberHandler.callSub(message, args)
    }
    else if(command === 'mlist'){
        memberHandler.getMemberships(message)
    }
    else if (command === 'mood'){
        random.mood(message)
    }
    else if(command === 'bupdate') {
        if(message.guild.id=='835723287714857031'){
           streamHandler.bupdate(client, false, message, args)
        }
    }
    else if(command === 'board'){
        if(message.guild.id!='835723287714857031'){
            let guild = await models.guild.findOne({guildID: message.guild.id})
            streamHandler.publicBoard(client, guild)
        }
    }
    else if(command === 'help'){
        message.channel.send({embeds:[{
        type: "rich",
        title: "__**Kari Commands**__",
        color: 'fff0f5',
        description:
        "**Administrator Commands**\n"+
        "*k!guildsetup* - Initial command for setting up server. Follow instructions and re-do if needed.\n\n"+

        "**Mod Commands**\n"+
        "*k!setup* - Initial command for setting up a talent. Follow instructions, answer with \"n\" on any field to skip it. Re-do if needed.\n"+
        "*k!clearmsgs* - Clears all scheduled stream notifications.\n"+
        "*k!clearsub <talent's first or last name>* - Clears a talent from server database. BE CAREFUL WITH USE. MAY INVALIDATE MEMBERSHIP DATA.\n"+
        "*k!mrclear <talent's first or last name> <roleID?> (or k!mroleclear)* - If no arguments given, clears talent's member role. Otherwise changes the member role to given role ID.\n"+
        "*k!mtlist <talent's first or last name>* - Lists all members for given talent name.\n"+
        "*k!mremove <talent's first or last name> <userID>* - Manually removes membership for given user from given talent.\n"+
        "*k!vchset <channelID>* - Sets a verification channel.\n"+
        "*k!mrole <talent's first or last name> <role ID>* - Sets a member role for a talent.\n"+
        "*k!mtalentsetup <talent's full name> <membership role ID> <alias_1> <alias_2> ...* - Sets up talent only for membership handling. Alias searching not yet implemented for other languages.\n"+
        "*k!brole <roleID?>* - If roleID argument is found, sets roleID to the given value. otherwise clears booster role.\n"+
        "*k!tset <talent's first or last name> <twitter handle>* - Sets up talent for twitter space detection and notifications.\n"+
        "*k!displaysubs* - Displays all current talent subscriptions and their current info. Use k!setup to edit their info.\n\n"+

        "**Booster Commands**\n"+
        "*k!seticon <role id> <attachment>* - Changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled). Only works if the copa role is the highest on the user invoking it.\n\n"+

        "**General Commands**\n"+
        "*k!help* - Displays this.\n"+
        "*k!bupdate* - Forces an update to the bulletin (Kawaii only)\n"+
        "*k!board* - Forces an update to the bulletin (Non-kawaii boards)\n"+
        "*k!github* - Displays kari github.\n" +
        "*k!live* - Displays all currently live streams in embeds.\n" +
        "*k!mlist* - Displays your current memberships and the staff who verified them\n"+
        "*k!member <talent's first or last name> <MM/DD/YYYY> <attachment>* - Adds you to the verification queue. One day before expiration you will recieve a DM notification to update your verification.\n"+
        "*k!ping* - Pong!\n"+
        "||*k!deeznuts*||"}]})
    }
    else if(command === 'github'){
        message.channel.send("https://github.com/tdyskinesia/Kari")
    }
    
});





client.login(process.env.TOKEN);
