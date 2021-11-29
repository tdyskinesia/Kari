const Discord = require('discord.js'); 

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;


const next = async(client, d)=>{
it(client); return
}

/**
 * @param  {Discord.Client} client
 */
const it = async(client) => {
try{
const sc = require('./scrape.js')

const statusOptions = [
    'Reina Sun',
    'Nene Amano',
    'Isla Coleman',
    'Charlotte Suzu',
    'Aruru Gray',
    'Shee Icho',
    'Namiji Freesia',
    'Lua Asuka',
    'Neena Makurano'
]



const strArr = await sc()
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
                        talent_id: dupe._id
                    })
                    await dupe.streams.push(ObjectId(s._id))
                    await dupe.save()
                }
        }
        vidIDs.push(vidID)
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
}

let counter = 0
let counter2 = 0
let counter3 = 0

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
                    name: statusOptions[counter],
                    type: 'WATCHING'
                }
            ]
        })
    }
    if(strArr.length==1){
        if(++counter3>=3){
            counter = 0;
            next(client); return
        }

    }
    else if(++counter >= strArr.length&&strArr.length>0){
        counter = 0;
        next(client); return

    }
    else if (++counter2 >= statusOptions.length){
        counter = 0;
        next(client); return
    }
    setTimeout(updateStatus, 1000 * 15)
}

updateStatus()
} catch (e) {console.log(e)}
}
    
module.exports = async(client)=>{ 
it(client);
}