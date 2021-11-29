const Discord = require('discord.js');

const talentSchema = require('../data/models');

const mongoose = require('mongoose');

const iterate = async(client) => {
    let guild = await client.guilds.cache.get('835723287714857031')
    for await(const talent of talentSchema.talent.find({guildID: '835723287714857031'})){
        for await (const str of talentSchema.stream.find({talent_id: talent._id})){
            let curDate = new Date(str.startTime) 
            if(curDate.setMinutes(curDate.getMinutes()-15) < new Date()){
                await (await guild.channels.cache.get(talent.liveChannelID)).send(`Hey <@&${talent.roleID}>! ${talent.name} is streaming in 15 minutes! Feel free to join us at https://www.youtube.com/watch?v=${str.videoID}`)
                let tal = await talentSchema.talent.findById(str.talent_id)
                    if(tal.liveChannelID!=null){
                        let ch = await (await client.guilds.fetch(tal.guildID)).channels.fetch(tal.liveChannelID)
                        if(ch.name.includes('🔊')||ch.name.includes('🛑')){
                            await ch.setName('🔔'.concat(ch.name.substring(1)))
                        }
                    }
                await talentSchema.stream.deleteOne({_id: str._id}).exec()
            }
        }
        await talent.save();
   }
}



module.exports = {
notify(client) {
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