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

const client = new Discord.Client();


const prefix = '!k';

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
    var initialJob = new CronJob('0 * * * *', function() {
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
                await sleep(2000);
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
    var index = 0
    var toDelete = []
    console.log("CHECKING FOR MESSAGES NOW")
    getYoutubeData(async function(err, data){
        if(err){
            console.log(err);
        } else {
            let db = new sqlite.Database('./db/database.db');
            let sql = 'SELECT start_time time, video_title title, video_link link, start_date date FROM messages ORDER BY id';   
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
                client.channels.cache.get(data[index].channel).send("HEY <@&" + data[index].role + "> " +data[index].name_out + " IS STREAMING IN 15 MINUTES\nWATCH THEM AT https://www.youtube.com/watch?v="+row.link);
                toDelete.push(index+1)
            }
        }
            index++;
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
    // first row only
    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          console.log(row.time, row.title, row.link);
          if (row.time != null){
            client.channels.cache.get('908671236895305760').send({embed: {
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
            }
        });  
            } else {
                client.channels.cache.get('908671236895305760').send({embed: {
                    type: "rich",
                    title: "NEXT UPCOMING STREAM",
                    color: '911c1c',
                    description: "NO UPCOMING STREAM",
                    author: {
                        name: data[index].name_out,
                        url: "https://www.youtube.com/channel/" + data[index].ytid
                    }
                }
            });
            }
            index++;
        });
      });
    db.close();

}

async function storeLiveTimes(ID, data, i){

    var vidID = await setStreams(ID, 0)
    var start = await getLiveTimes(vidID)
    let db = new sqlite.Database('./db/database.db')
    if(start!=null){
    console.log("START TIME "+start[0])
    //db insert schedule message for time
    //if date has passed, call setStreams with another index to get next upcoming stream, if exists
    let curDate = new Date(start[0])
    let now = new Date()
    if(curDate < now){
        vidID = await setStreams(ID, 1)
        start = await getLiveTimes(vidID)
    }
    let date = start[0]
    let time = moment(start[0])
    var times = [time.tz('America/Los_Angeles').format('ha z'),
    time.tz('America/New_York').format('ha z'),
    time.tz('Asia/Tokyo').format('ha z')];   
    times.join("  ");
    console.log(times);

    db.run(`INSERT INTO messages VALUES(?, ?, ?, ?, ?)`, [i+1, times, start[1], vidID, date], function(err) {
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

async function getLiveTimes(link){
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

async function setStreams(id, index){
        var c = 0;
        var startTime = "";
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
            console.log("Response", response);
            //for(var i in response.data.items) 
            //{c++}
            if(response.data.items[index]!=null){
                return response.data.items[response.data.items.length-(index+1)].id.videoId;
            } else { return null };
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
                await outputLiveTimes(data);
        

                console.log('LIVE TIMES OUTPUTTED');
            }
           });
        }
    }
});

client.login(process.env.TOKEN);
db.close();
