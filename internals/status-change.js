const Discord = require('discord.js'); 

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;


const next = async(client)=>{
it(client); return
}

/**
 * @param  {Discord.Client} client
 */
const it = async(client) => {
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



let strArr = await sc()
let vidIDs = []
if(strArr!=null&&strArr.length>0){
    for await(const str of strArr){
        await stream.deleteMany({videoID: str[2].substring(str[2].length-11), startTime: {$exists: true}}).exec()
            if((await stream.find({videoID: str[2].substring(str[2].length-11), dStart: {$exists: true}}).exec()).length==0){
                for await (const dupe of talent.find({name: str[0]})){
                    s = await stream.create({
                        streamName: str[1],
                        dStart: new Date(),
                        videoID: str[2].substring(str[2].length-11),
                        talent_id: dupe._id
                    })
                    await dupe.streams.push(ObjectId(s._id))
                    await dupe.save()
                }
        vidIDs.push(str[2].substring(str[2].length-11))
        }
    }


    for await (const str of stream.find({videoID: {$nin: {vidIDs}}, dStart: {$exists: true}})){
        let tal = await talent.findById(str.talent_id)
        if(tal.liveChannelID!=null){
            let ch = await (await client.guilds.fetch(tal.guildID)).channels.fetch(tal.liveChannelID)
            if(ch.name.substring(0,1)=='▶'){
                await ch.setName(ch.name.substring(1))
            }
        }
    }

    await stream.deleteMany({videoID: {$nin: {vidIDs}}, dStart: {$exists: true}}).exec()

    for await(const str of stream.find({dStart: {$exists: true}, videoID: {$in: {vidIDs}}})){
        let tal = await talent.findById(str.talent_id)
        if(tal.liveChannelID!=null){
            let ch = await (await client.guilds.fetch(tal.guildID)).channels.fetch(tal.liveChannelID)
            if(ch.name.substring(0,1)!='▶'){
                await ch.setName('▶'.concat(ch))
            }
        }
    }
}

let counter = 0
let counter2 = 0

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
    
    if(++counter >= strArr.length&&strArr.length>0){
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
}
    
module.exports = async(client)=>{ 
next(client); return
}