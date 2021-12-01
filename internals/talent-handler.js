const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const mongoose = require('mongoose');


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
    async mainSetup(message, args, client){
        try{
            await message.channel.send("Input Talent's Full Name **(Required)**")
            const filter = m => {return m.author.id==message.author.id}
            let talentName = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            await message.channel.send("Input Talent's YoutubeID **(Required For Notifications or Board Updates)**")
            let ytID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(ytID.content=='n'){ytID = undefined} else ytID = ytID.content
            await message.channel.send("Input Talent's Discord Live Channel ID **(Required For Notifications)**")
            let liveID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(liveID.content=='n'){liveID = undefined} else liveID = liveID.content
            await message.channel.send("Input Talent's Discord Live Notification Role ID **(Required For Notifications)**")
            let liveRoleID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(liveRoleID.content=='n'){liveRoleID = undefined} else liveRoleID = liveRoleID.content
            await message.channel.send("Input Talent's Discord Membership Role ID **(Required For Membership Handling)**")
            let membershipRoleID = (await message.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})).first()
            if(membershipRoleID.content=='n'){membershipRoleID = undefined} else membershipRoleID = membershipRoleID.content
        
            let tal = await talent.create({
                name: talentName,
                youtubeID: ytID,
                liveChannelID: liveID,
                roleID: liveRoleID,
                memberRoleID: membershipRoleID,
                guildName: message.guild.name,
                guildID: message.guild.id
            })

            let liveChannel = message.guild.channels.cache.get(tal.liveChannelID)
            let role = message.guild.roles.cache.get(tal.roleID)
            let memRole = message.guild.roles.cache.get(tal.memberRoleID)
            if(liveChannel!=null) liveChannel = liveChannel.toString()
            if(role!=null) role = role.name
            if(memRole!=null) memRole = memRole.name
            await message.channel.send(`New sub entered! {Name: ${tal.name} YTID: ${tal.youtubeID} Live Channel: ${liveChannel} Live Role Name: ${role} Membership Role Name: ${memRole}}`)
            await message.channel.send(`If any info for your channel sub is incorrect, use k!subclear <talent name> and restart the sub process.`)
            if(tal.liveChannelID!=null){
                let ch = await client.channels.fetch(tal.liveID)
                await ch.setName('🛑'.concat(ch.name))
            }
        }catch (e){
            await message.channel.send("Incorrect Input or Input Timeout")
            console.log(e)
        }
    }

}