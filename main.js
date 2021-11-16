const dotenv = require('dotenv');
dotenv.config(); 

const sqlite = require('sqlite3').verbose();

const {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: "AIzaSyBPY0_LA0G7jd3o2YH22SVxfLESjxTTvRA"
})

const { MessageEmbed } = require('discord.js');

var today = new Date();

var CronJob = require('cron').CronJob;

const moment = require('moment-timezone');

const Discord = require('discord.js'); 

const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS],
presence: {
    status: 'online',
    activity: {
        name: 'Aria',
        type: 'WATCHING',
    }
} });


const prefix = 'k!';

const fs = require('fs');
const { id } = require('date-fns/locale');

client.commands = new Discord.Collection();

var talentList = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let db = new sqlite.Database('./db/database.db');

db.run(`
  CREATE TABLE IF NOT EXISTS subs (
    "id" INTEGER PRIMARY KEY,
    "youtube_id" TEXT,
    "channel_id" TEXT,
    "role_id" TEXT,
    "name" TEXT
  )
`);
db.run(`
CREATE TABLE IF NOT EXISTS messages (
    "id" INTEGER PRIMARY KEY,
    "start_time" TEXT,
    "video_title" TEXT,
    "video_link" TEXT,
    "start_date" TEXT
)
`);
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.once('ready', async () =>{
    console.log('Online');
    console.log(process.env.A);
    console.log(process.env.B);
    console.log(today.getMinutes());
    console.log(today.getHours());
    client.user.setPresence({
        status: 'available',
        activity: {
            name: 'Aria',
            type: 'WATCHING',
            url: 'https://www.youtube.com/channel/UCKJexadCeNo3lu0U20skmNg'
        }
    });
    var initialJob = new CronJob('0 */3 * * *', function() {
        console.log("I AM UPDATING STREAM TIMES NOW");
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
           });
    }, null, true, 'America/New_York');

    checkForPosts();
    setInterval(checkForPosts, 1000 * 30)

});

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

function checkForPosts(){
    var toDelete = []
    console.log("CHECKING FOR MESSAGES NOW")
    getYoutubeData(async function(err, data){
        if(err){
            console.log(err);
        } else {
            let db = new sqlite.Database('./db/database.db');
            let sql = 'SELECT id rowID, start_time time, video_title title, video_link link, start_date date FROM messages ORDER BY id';   
    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
            if(row.time!=null){
            let curTime = row.time
            console.log(row.time)
            var minutes = 0
            curTime = curTime.substring(0, curTime.indexOf(" ")-2)
            if(curTime.search(":")!=-1){
                minutes = curTime.substring(curTime.search(":"))
                curTime = curTime.substring(0, curTime.search(":"))
            }
            let curDate = new Date(row.date)
            console.log(curDate)
            console.log(Date.now())
            let now = new Date()
            console.log(now)
            if(curDate.setMinutes(curDate.getMinutes()-15) < now){
                console.log("SENDING MESSAGE NOW")
                client.channels.cache.get(data[row.rowID-1].channel).send("HEY <@&" + data[row.rowID-1].role + "> " +data[row.rowID-1].name_out + " IS STREAMING IN 15 MINUTES\nWATCH THEM AT https://www.youtube.com/watch?v="+row.link);
                toDelete.push(row.rowID)
            }
        }
        });
        console.log(toDelete)
    for(var i in toDelete){
        db.run(`DELETE FROM messages WHERE id = ` + toDelete[i])
    }

        });
}

});
}

async function outputLiveTimes(data){
    let db = new sqlite.Database('./db/database.db');

    let sql = 'SELECT start_time time, video_title title, video_link link, start_date date FROM messages ORDER BY id';
    var index = 0;
    const channel = client.channels.cache.get('908671236895305760')
    // first row only
    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          console.log(row.time, row.title, row.link)

          if (row.time != null){
            channel.send({embeds: [{
                type: "rich",
                title: "NEXT UPCOMING STREAM",
                color: '2b7d14',
                description: row.title + "\n" + row.time + "\n" + "In "+(Math.round(Math.abs(new Date()-new Date(row.date))/3600000))+" Hours",
                fields: [{
                    name: 'WAITING ROOM',
                    value: "https://www.youtube.com/watch?v="+row.link
                    }],
                author: {
                    name: data[index].name_out,
                    url: "https://www.youtube.com/channel/" + data[index].ytid
                }
            }]
        });  
            } else {
                channel.send({embeds: [{
                    type: "rich",
                    title: "NEXT UPCOMING STREAM",
                    color: '911c1c',
                    description: "NO UPCOMING STREAM",
                    author: {
                        name: data[index].name_out,
                        url: "https://www.youtube.com/channel/" + data[index].ytid
                    }
                }]
            });
            }
            index++;
        });
      });
    db.close();

}

async function storeLiveTimes(ID, data, i){

    var start = await setStreams(ID)
    //var start = await getLiveTimes(vidID)
    let db = new sqlite.Database('./db/database.db')
    if(start!=null){
    console.log("START TIME "+start[0])
    let date = start[0]
    let time = moment(start[0])
    
    var times = [time.tz('America/Los_Angeles').format('ha z'),
    time.tz('America/New_York').format('ha z'),
    time.tz('Asia/Tokyo').format('ha z')];   
    times.join("  ");
    console.log(times);

    db.run(`INSERT INTO messages VALUES(?, ?, ?, ?, ?)`, [i+1, times, start[1], start[2], date], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        return this.lastID.toString();
      });
        //await client.channels.cache.get(data[i].channel).send("<@&" + data[i].role + "> "+"https://www.youtube.com/watch?v="+vidID);
        //await client.channels.cache.get(data[i].channel).send("START TIME: "+times);
    } else {
        db.run(`INSERT INTO messages VALUES(?, ?, ?, ?, ?)`, [i+1, null, null, null, null], function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);
            return this.lastID.toString();
          });
        //await client.channels.cache.get('905628281859092490').send("No stream upcoming for " + data[i].name);
        
    }
        db.close();

}
//unused
async function makeEmbed(data, i, start, times, vidID){
    return new MessageEmbed()
    .setColor("2b7d14")
    .setAuthor(data[i].name)
    .setDescription("<@&" + data[i].role + "> " + "UPCOMING: " + start[1] + "\n" + times)
    .addField("["+start[1]+"]"+"(https://www.youtube.com/watch?v="+vidID+")");

}
//unused
async function makeNoUpcomingEmbed(data, i){
    return new MessageEmbed()
                .setColor("2b7d14")
                .setAuthor(data[i].name)
                .setDescription("NO UPCOMING STREAM");
}
//unused
async function getLiveTimes(link, index){
    console.log("entered second loop");
    console.log("LINK: "+link);
    if(link!=null){
        var response2 = await yt.videos.list({
            "part": [
                "liveStreamingDetails, snippet"
            ],
            "id": [
                link
            ]
        });
        console.log("Response2", response2);
        return [response2.data.items[0].liveStreamingDetails.scheduledStartTime, response2.data.items[0].snippet.title];
        } else {
        return null;
    }

}

async function setStreams(id){
        var c = 0
        var startTime = ""
        var dateArray = []
        var results = []
        var response = await yt.search.list({
            "part": [
                "id"
            ],
            "channelId": id,
            "eventType": "upcoming",
            "order": "date",
            "type": [
            "video"
            ]
            });
            if(response.data.items[0]!=null){
            console.log("Response", response);
            for(var i in response.data.items){
                results.push(await yt.videos.list({
                    "part": [
                    "liveStreamingDetails, snippet"
                ],
                "id": [
                    response.data.items[i].id.videoId
                ] 
                }))
                console.log(results[i])
            }

            results.sort(function(a, b) {
                return new Date(a.data.items[0].liveStreamingDetails.scheduledStartTime) - new Date(b.data.items[0].liveStreamingDetails.scheduledStartTime);
              });
            for (var i in results){console.log(results[i].data.items[0].liveStreamingDetails.scheduledStartTime) }
            now = new Date()
            for (var index in results){
                if(new Date(results[index].data.items[0].liveStreamingDetails.scheduledStartTime) > now){
                    return([results[index].data.items[0].liveStreamingDetails.scheduledStartTime, results[index].data.items[0].snippet.title, results[index].data.items[0].id, results[index].data.items[0].snippet.thumbnails.default.url])
                }
            } 
        } else {return null}
            
}

async function getYoutubeData(callback){
    let db = new sqlite.Database('./db/database.db');

    let sql = 'SELECT channel_id channel, role_id role, name name_out, youtube_id ytid FROM subs ORDER BY id';

    var curArray = [];
    
    db.all(sql, [], (err, rows) =>{
        if(err){
            console.error(err.message);
            return callback(err);
        }
        rows.forEach((row)=> {
            curArray.push(row);
            console.log(curArray);
        })
        db.close();
        callback(null, curArray);
    })

}

async function getMessageData(callback){
    let db = new sqlite.Database('./db/database.db')
            
    var curArray = [];
    let sql = 'SELECT start_date date FROM messages ORDER BY id'
    db.all(sql, [], (err, rows) =>{
        if(err){
            console.error(err.message);
            return callback(err);
        }
        rows.forEach((row)=> {
            curArray.push(row);
            console.log(curArray);
        })
        db.close();
        callback(null, curArray);
    })

}

async function displaySubData(data, message){
    for(var i in data){
        await message.channel.send(data[i].name_out + ": " + data[i].ytid + " " + data[i].channel + " " + data[i].role)
    }
}

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(message.member.permissions.has("BAN_MEMBERS")){

    if(command === 'ping'){
        client.commands.get('ping').execute(message, args);
    }
    else if(command === 'setup'){
        /*fs.writeFile('lastID.json', client.commands.get('sub talent').execute(message, command, args), (err => {
            if(err){
                console.log(err);
            }
        }));*/
        client.commands.get('sub talent').execute(message, command, args)
    }
    else if(command === 'sublist'){
        message.channel.send(talentList.toString());
    }
    else if(command === 'clearsub'){
        client.commands.get('clear sub').execute(message, args)
    }
    else if(command === 'clearmsgs'){
        client.commands.get('clear msgs').execute(message, args)
    }
    else if(command === 'bupdate'){
    console.log("I AM UPDATING STREAM TIMES NOW")
    var data = []
        getYoutubeData(async function(err, data){
            if(err){
                console.error(err.message)
            } else {
                sleep(2000)
                console.log("data array "+data)
                console.log(data[0].channel)
                console.log(data[2].ytid)
                console.log('LIVE TIMES OUTPUTTING')
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
                db.close();
            for (let index = 0; index < data.length; index++) {
                    await storeLiveTimes(data[index].ytid, data, index);  
            }
                await sleep(5000);
                await outputLiveTimes(data);
        

                console.log('LIVE TIMES OUTPUTTED');
            }
           });
        }
    } 
    if (message.member.permissions.has("MENTION_EVERYONE")){
        if(command === 'timeset'){
            if(args.length==2){
            getMessageData(async function(err, row){
            if(err){
                console.error(err.message)
            } else {
            
            let db = new sqlite.Database('./db/database.db')
            let d1 = new Date(row[parseInt(args[1])-1].date)
            d1.setMinutes(d1.getMinutes()+parseInt(args[0]))
            let sql = `UPDATE messages 
            SET start_date = ? 
            WHERE id = ?`;
            
            db.run(sql, [d1.toISOString(), args[1]], function(err){
                if(err){
                    console.error(err.message);
                }
            })
            }
        });
            } else {
                message.channel.send("You fucked up I think bro.")
            }
        }
        
        else if(command === 'displaysubs'){
            getYoutubeData(async function(err, data){
            if(err){
                console.error(err.message)
            } else {
                sleep(2000)
                console.log("data array "+data)
                await displaySubData(data, message)
            }
            });
        }
        else if (command === 'displaymsgs'){
            getYoutubeData(async function(err, data){
                if(err){
                    console.error(err.message)
                } else {
                    sleep(2000)
                    let db = new sqlite.Database('./db/database.db');
                    let sql = 'SELECT id rowID, start_time time, video_title title, video_link link, start_date date FROM messages ORDER BY id';
                    db.all(sql, [], (err, rows) => {
                        if (err) {
                          throw err;
                        }
                        rows.forEach((row) => {
                            if (row.time!=null){
                            console.log("Outputting row " + row.rowID)
                            message.channel.send(row.rowID + " " + data[row.rowID-1].name_out + ": " + row.title + " " + row.time + " " + row.date + "<https://www.youtube.com/watch?v=" + row.link+">")
                            }

                        });
                    });

                }
            });
        }
    }
    if(message.member.roles.cache.has('835813294152744982')||message.member.permissions.has("BAN_MEMBERS")){
        if(command === 'seticon'){
            var image = message.attachments
            var link = image.first().url
            if(image.first().size<256,000){
            if(message.member.roles.cache.has(args[0])){
                const role = message.guild.roles.cache.get(args[0])
                role.setIcon(link)
                message.channel.send("Role Icon Set")
            }else{
                message.channel.send("You do not have that role ID")
            }
        } else {
            message.channel.send("Image file size error (over 256kb)")
        }

        }
    }
    if(command === 'deeznuts'){
        message.channel.send("deez nuts")
        message.delete()
    }
    else if(command === 'help'){
        message.channel.send(
        `Kari Commands

        Mod Commands
        k!setup <talent name> <YouTube channel ID> <live channel id> <role id>
        - subs talent to automatic updates
        k!ping - checks if bot is alive by returning the next upcoming feesh stream
        k!clearmsgs - clears all scheduled stream notifications
        k!bupdate - forces an update to the bulletin
        k!clearsub <live channel id> - clears a talent from live scheduling

        Tagger Commands
        k!timeset <minutes> <rowID> manually adds minutes to a previously scheduled notification (to use if a stream is manually rescheduled)
        k!displaysubs - displays current sub list
        k!displaymsgs - displays current upcoming notifications for streams and their rowID for timeset

        Booster Commands
        k!seticon <role id> - changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled)

        General Commands
        k!help - displays this
        k!deeznuts - what do you think this does?`)
    }
    
});

client.login(process.env.TOKEN);
db.close();
