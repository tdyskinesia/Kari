const Discord = require('discord.js');

const talentSchema = require('../data/talentSchema');

const mongoose = require('mongoose');

const iterate = async(client) => {
    for await(const talent of talentSchema.talent.find(!{guildID: '838711689125822474'})){
        talent.upcomingStreams.forEach(async function(stream){
            let curDate = new Date(stream.startTime)
            if(curDate.setMinutes(curDate.getMinutes()-15) < new Date()){
                await (await client.channels.cache.get(talent.liveChannelID)).send(`Hey ${talent.roleID}! ${talent.name} is streaming in 15 minutes! Feel free to join us at https://www.youtube.com/watch?v=${stream.videoID}`)
                talentSchema.stream.deleteOne({id: stream.id}, function (err, id){
                    if(err) console.log(err)
                    console.log(`Deleted ${id}`)
                })
            }
        });
        await talent.save();
   }
}

module.exports = {
async notify(client) {
    console.log("Checking for stream notifications now!")
    await iterate(client)
    setTimeout(iterate(), 1000 * 30)  
},

async clearNotifications(){
    console.log("Clearing all notifications now")
    for await(const talent of talentSchema.talent.find()){
        talent.upcomingStreams = []
        await talent.save();
    }
}

}