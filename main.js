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

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
partials: ['MESSAGE', 'GUILD_MEMBER', 'CHANNEL', 'USER', 'REACTION'] });

const statusChange = require('./internals/status-change.js');

const streamHandler = require('./internals/stream-handler.js');

const talentHandler = require('./internals/talent-handler.js')

const messageHandler = require('./internals/message-handler.js')

const memberHandler = require('./internals/member-handler.js')

const guildHandler = require('./internals/guild-handler.js')

const talentSchema  = require('./data/models.js')

const memberRoles = require('./internals/member-roles.js')

const prefix = 'k!';

const fs = require('fs');
const { id } = require('date-fns/locale');

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
    statusChange(client);

    var initialJob = new CronJob('0 */3 * * *', async function() {
        await streamHandler.bupdate(client)
    }, null, true, 'America/New_York');

    memberRoles(client, prefix);
    messageHandler.notify(client);
    setInterval(messageHandler.notify.bind(null, client), 1000 * 30);
    
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(message.member.permissions.has("ADMINISTRATOR")){

    if(command === 'guildsetup'){
        guildHandler.setupGuild(message, args)
    }
    }
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
           streamHandler.bupdate(client, message, args)
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
        memberHandler.manualMembershipRemove(message, args)
    }
    else if(command === 'mtlist'){
        memberHandler.talentMembers(message, args)
    }
    // else if(command === 'migrate'){
    //     memberHandler.migrate2(message, args)
    // }
    else if(command === 'mtalentsetup'){
        memberHandler.subMembershipTalent(message, args)
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
    else if(command === 'member'){
        memberHandler.callSub(message, args)
    }
    else if(command === 'mlist'){
        memberHandler.getMemberships(message)
    }
    else if(command === 'help'){
        message.channel.send({embeds:[{
        type: "rich",
        title: "__**Kari Commands**__",
        color: 'fff0f5',
        description:
        "**Administrator Commands**\n"+
        "*k!guildsetup <-n?>* - Initial command for setting up server. Use -n flag to disable notifications. (For later features.)\n\n"+

        "**Mod Commands**\n"+
        "*k!setup <talent name> <YouTube channel ID> <live channel ID> <roleID>* - subs talent to automatic updates\n"+
        "*k!clearmsgs* - clears all scheduled stream notifications\n"+
        "*k!bupdate <-o?>* - forces an update to the bulletin. the -o flag outputs the last saved data to the current channel without using any api requests\n"+
        "*k!clearsub <live channel ID>* - clears a talent from live scheduling\n"+
        "*k!mrclear <roleID?> (or k!mroleclear)* - if no arguments given, clears talent's member role. otherwise changes the member role to given role ID\n"+
        "*k!mtlist <talent name>* - lists all members for given talent name\n"+
        "*k!mremove <talent name> <userID>* - manually removes membership for given user from given talent\n"+
        "*k!vchset <channelID>* - sets a verification channel\n"+
        "*k!mrole <talent name> <role ID>* - sets a member role for a talent\n"+
        "*k!mtalentsetup <talent name> <membership role ID> <alias_1> <alias_2> ...* - Sets up talent only for membership handling. Alias searching not yet implemented for other languages.\n\n"+
        
        "**Tagger Commands**\n"+
        "*k!timeset <video ID> <minutes>* - manually adds minutes to a previously scheduled notification (to use if a stream is manually rescheduled)\n"+
        "*k!displaysubs* - displays current sub list\n"+
        "*k!displaystreams* - displays current upcoming notifications for streams and their rowID for timeset\n\n"+

        "**Booster Commands**\n"+
        "*k!seticon <role id> <attachment>* - changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled)\n\n"+

        "**General Commands**\n"+
        "*k!help* - displays this\n"+
        "*k!github* - displays kari github\n" +
        "*k!mlist* - displays your current memberships and the staff who verified them\n"+
        "*k!member <talent name> <MM/DD/YYYY> <attachment>* - adds you to the verification queue. one day before expiration you will recieve a DM notification to update your verification\n"+
        "*k!ping* - pong\n"+
        "*k!deeznuts* - what do you think this does?"}]})
    }
    else if(command === 'github'){
        message.channel.send("https://github.com/tdyskinesia/Kari")
    }
    
});





client.login(process.env.TOKEN);
