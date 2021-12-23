const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const mongoose = require('mongoose');

const twitterHandler = require('./internals/twitter-handler.js')


module.exports = {
    async deleteTalent(message, args){
        talent.deleteMany({name: {$regex: ".*"+args[0]+ ".*", $options: 'i'}, guildID: message.guild.id}).then(function(){
            message.channel.send("All records deleted.");
        }).catch(function(error){
            console.log(error);
        });

    },
    /**
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async mainSetup(message, twitterClient){
        try{
            await message.channel.send("Input Talent's Full Name **(Required)**")
            const filter = m => {return m.author.id==message.author.id}
            let talentName = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            await message.channel.send("Input Talent's YoutubeID **(Required For Notifications or Board Updates)**(n to skip)")
            let ytID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(ytID.content.toLowerCase()=='n'){ytID = undefined} else ytID = ytID.content
            await message.channel.send("Input Talent's Discord Live Channel ID **(Required For Notifications)**(n to skip)")
            let liveID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(liveID.content.toLowerCase()=='n'){liveID = undefined} else liveID = liveID.content
            await message.channel.send("Input Talent's Discord Live Notification Role ID **(Required For Notifications)**(n to skip)")
            let liveRoleID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(liveRoleID.content.toLowerCase()=='n'){liveRoleID = undefined} else liveRoleID = liveRoleID.content
            await message.channel.send("Input Talent's Twitter Handle **(Required For Twitter Space Detection / Notifications)**(n to skip)")
            let handle = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            let twitterID = undefined;
            if(liveRoleID.content.toLowerCase()=='n'){handle = undefined} 
            else 
            {
                handle = handle.content
                if(handle.substring(0,1)==='@'){handle = handle.substring(1)}
                let { data } = await twitterClient.get('users/by', {usernames: handle})
                if(data!=null){twitterID = data[0].id}
            }
            await message.channel.send("Input Talent's Discord Membership Role ID **(Required For Membership Handling)**(n to skip)")
            let membershipRoleID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(membershipRoleID.content.toLowerCase()=='n'){membershipRoleID = undefined} else membershipRoleID = membershipRoleID.content
        
            let tal = await talent.findOneAndUpdate(
                {name: talentName, guildID: message.guild.id},
                {'$set':{
                "youtubeID": ytID,
                "liveChannelID": liveID,
                "roleID": liveRoleID,
                "memberRoleID": membershipRoleID,
                "guildName": message.guild.name,
                "twitterID": twitterID,
            }}, {new: true, upsert: true}).exec()


            let liveChannel = ""; let role = ""; let memRole = ""; let tID = "";
            if(tal.liveChannelID!=null) {liveChannel = message.guild.channels.cache.get(tal.liveChannelID).toString()} else liveChannel = "NULL"
            if(tal.roleID!=null) {role = message.guild.roles.cache.get(tal.roleID).name} else role = "NULL"
            if(tal.memberRoleID!=null) {memRole = message.guild.roles.cache.get(tal.memberRoleID).name} else memRole = "NULL"
            if(tal.twitterID!=null) {tID = tal.twitterID}
            await message.channel.send(`New sub entered! {Name: ${tal.name} YTID: ${tal.youtubeID} Live Channel: ${liveChannel} Live Role Name: ${role} Membership Role Name: ${memRole} Twitter ID: ${tID}}`)
            await message.channel.send(`If any info for your channel sub is incorrect, use k!subclear <talent name> and restart the sub process.`)
            if(tal.liveChannelID!=null){
                let ch = await message.guild.channels.fetch(tal.liveChannelID)
                await ch.setName('🛑'.concat(ch.name))
            }
        }catch (e){
            await message.channel.send("Incorrect Input or Input Timeout")
            console.log(e)
        }
    }

}