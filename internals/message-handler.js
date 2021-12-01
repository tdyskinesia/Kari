const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');

const iterate = async(client) => {
try{
    for await(const guild of models.guild.find({notificationsFlag: true})){
        for await(const talent of talent.find({guildID: guild.guildID})){
            for await (const str of stream.find({talent_id: talent._id})){
                let curDate = new Date(str.startTime) 
                if(curDate.setMinutes(curDate.getMinutes()-15) < new Date()){
                    await (await guild.channels.cache.get(talent.liveChannelID)).send(`Hey <@&${talent.roleID}>! ${talent.name} is streaming in 15 minutes! Feel free to join us at https://www.youtube.com/watch?v=${str.videoID}`)
                    let tal = await talent.findById(str.talent_id)
                        if(tal.liveChannelID!=null){
                            let ch = await (await client.guilds.fetch(tal.guildID)).channels.fetch(tal.liveChannelID)
                            if(ch.name.includes('🔊')||ch.name.includes('🛑')){
                                await ch.setName('🔔'.concat(ch.name.substring(1)))
                            }
                        }
                    await stream.deleteOne({_id: str._id}).exec()
                }
            }
            await talent.save();
        }
    }
} catch (e) {console.log(e)}
}



module.exports = {
notify(client) {
    iterate(client) 
    
},

async clearNotifications(message){
    console.log("Clearing all notifications now")
    for await(const tal of talent.find({guildID: message.guild.id})){
        await stream.deleteMany({talent_id: talent._id}).exec()
    }
}

}