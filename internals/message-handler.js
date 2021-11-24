const Discord = require('discord.js');

const talentSchema = require('../data/talentSchema');

const mongoose = require('mongoose');

const iterate = async(client) => {
    let guild = await client.guilds.cache.get('835723287714857031')
    let arr = []
    for await(const talent of talentSchema.talent.find({guildID: '835723287714857031'})){
        talent.upcomingStreams.forEach(async function(stream){
            let curDate = new Date(stream.startTime) 
            if(curDate.setMinutes(curDate.getMinutes()-15) < new Date()){
                await (await guild.channels.cache.get(talent.liveChannelID)).send(`Hey ${talent.roleID}! ${talent.name} is streaming in 15 minutes! Feel free to join us at https://www.youtube.com/watch?v=${stream.videoID}`)

                talentSchema.talent.findOneAndUpdate({_id: talent.id}, {
                    $pull: {
                        'talent.$.upcomingStreams':{ _id: stream.id } 
                    }, function (error, result){
                        console.log(result)
                    }
                }).save()
            }
        });
        await talent.save();
   }
}



module.exports = {
notify(client) {
    console.log("Checking for stream notifications now!")
    iterate(client) 
    
},

async clearNotifications(){
    console.log("Clearing all notifications now")
    for await(const talent of talentSchema.talent.find()){
        talent.upcomingStreams = []
        await talent.save();
    }
}

}