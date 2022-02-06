const Discord = require('discord.js'); 

const {talent, space, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;
const sc = require('./scrape.js')
const twitterHandler = require('./twitter-handler.js')


const next = async(client, arr, twitterClient)=>{
    
it(client, arr, twitterClient); return
}

/**
 * @param  {Discord.Client} client
 */
const it = async(client, arr, twitterClient) => {
try{


// const statusOptions = [
//     'Reina Sun',
//     'Nene Amano',
//     'Isla Coleman',
//     'Charlotte Suzu',
//     'Aruru Gray',
//     'Shee Icho',
//     'Namiji Freesia',
//     'Lua Asuka',
//     'Neena Makurano'
// ]

const statusOptions = []

for await (const tal of talent.find({youtubeID: {$exists: true}})){
    statusOptions.push(tal.name)
}

let strArr = []
if(arr==null){
strArr = await sc()
if(strArr==null){
    strArr = []
}
} else strArr = arr
let vidIDs = []
if(strArr!=null&&strArr.length>0){
    for await(const str of strArr){
        let vidID = str[2].substring(str[2].length-11)
        await stream.deleteMany({videoID: vidID, startTime: {$exists: true}}).exec()
            if((await stream.find({videoID: vidID, dStart: {$exists: true}}).exec()).length==0){
                for await (const dupe of talent.find({name: str[0]})){
                    s = await stream.create({
                        streamName: str[1],
                        dStart: new Date(),
                        videoID: vidID,
                        thumbnailUrl: str[3],
                        description: str[4],
                        talent_id: dupe._id
                    })
                    await dupe.streams.push(ObjectId(s._id))
                    await dupe.save()
                }
        }
        vidIDs.push(vidID)
    }

}
    for await (const str of stream.find({videoID: {$nin: vidIDs}, dStart: {$exists: true}})){
        let tal = await talent.findById(str.talent_id)
        if(tal.liveChannelID!=null){
            let ch = await (await client.guilds.fetch(tal.guildID)).channels.fetch(tal.liveChannelID)
            if(ch.name.includes('🔊')||ch.name.includes('🔔')){
                await ch.setName('🛑'.concat(ch.name.substring(1)))
            }
        }
    }

    await stream.deleteMany({videoID: {$nin: vidIDs}, dStart: {$exists: true}}).exec()

    for await(const str of stream.find({dStart: {$exists: true}, videoID: {$in: vidIDs}})){
        let tal = await talent.findById(str.talent_id)
        if(tal.liveChannelID!=null){
            let ch = await (await client.guilds.fetch(tal.guildID)).channels.fetch(tal.liveChannelID)
            if(ch.name.includes('🛑')||ch.name.includes('🔔')){
                await ch.setName('🔊'.concat(ch.name.substring(1)))
            }
        }
    }
    for await(const str of stream.find({startTime: {$exists: true}})){
        let d = new Date()
        if(str.startTime < d.setMinutes(d.getMinutes()-30)){
            await stream.findByIdAndDelete(str._id).exec()
        }
    }
    for await (const g of guild.find({notificationsFlag: true})){
        await twitterHandler.iterateTalents(client, twitterClient, g)
    }

    for await(const curSpace of space.find()){
        let tal = await talent.findById(curSpace.talent_id).lean().exec()
        strArr.push([tal.name, "Twitter Space - "+curSpace.title, "https://twitter.com/i/spaces" + curSpace.id])
    }


let counter = 0
let counter2 = 0
let counter3 = 0
let finalBool = false

const updateStatus = async() => {
    if(strArr.length!=0){
    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: strArr[counter][0] + ": " + strArr[counter][1],
                type: 'WATCHING',
                url: strArr[counter][2]
            }
        ]
    })
}
    if(strArr.length==0){
        client.user.setPresence({
            status: 'online',
            activities: [
                {
                    name: statusOptions[counter2],
                    type: 'WATCHING'
                }
            ]
        })
    }
    if(strArr.length>0){
        if(counter3==1){
            counter3 = 0;
            next(client, null, twitterClient); return
        } 
        else if(++counter>=strArr.length){
            counter=strArr.length-1
            counter3=1
            if(strArr.length<=2&&!finalBool){
            counter3=0
            counter=0
            finalBool = true
            }
        }

    }
    else if (++counter2 >= statusOptions.length){
        counter2 = 0;
        next(client, null, twitterClient); return
    }
    if(counter2!=0 && counter2%5==0){
        let arr = await sc()
        if (arr==null) arr = []
        if(arr.length>0){
            counter2=0
            next(client, arr, twitterClient); return
        }
    }
    setTimeout(updateStatus, 1000 * 15)
}

updateStatus()
} catch (e) {console.log(e)}
}
    
module.exports = async(client, arr, twitterClient)=>{ 
it(client, arr, twitterClient); return
}