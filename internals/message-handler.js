const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');
/**
 * @param  {Discord.Client} client
 */
const iterate = async(client) => {
try{
    for await(const guild of models.guild.find({notificationsFlag: true})){
        for await(const tal of talent.find({guildID: guild.guildID})){
            for await (const str of stream.find({talent_id: tal._id})){
                let curDate = new Date(str.startTime) 
                let curGuild = await client.guilds.fetch(guild.guildID)
                if(curDate.setMinutes(curDate.getMinutes()-15) < new Date()){
                    await (curGuild.channels.fetch(tal.liveChannelID)).send(`Hey <@&${tal.roleID}>! ${tal.name} is streaming in 15 minutes! Feel free to join us at https://www.youtube.com/watch?v=${str.videoID}`)
                        if(tal.liveChannelID!=null){
                            let ch = await curGuild.channels.fetch(tal.liveChannelID)
                            if(ch.name.includes('🔊')||ch.name.includes('🛑')){
                                await ch.setName('🔔'.concat(ch.name.substring(1)))
                            }
                        }
                    await stream.deleteOne({_id: str._id}).exec()
                }
            }
            await tal.save();
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
        await stream.deleteMany({talent_id: tal._id}).exec()
    }
}

}