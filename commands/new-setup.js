module.exports = {
    name: 'new setup',
    description: "new setup for mongodb",
    async execute(message, args){
        const mongoose = require('mongoose');
        
        const Discord = require('discord.js');

        const talentSchema = require('../data/models');
   
        talentSchema.talent.create({
            name: args[0] + " " + args[1],
            youtubeID: args[2],
            liveChannelID: args[3],
            roleID: args[4],
            guildName: message.guild.name,
            guildID: message.guild.id
        }, function(err, small){
            if (err) return handleError(err);
        })
        let liveChannel = await message.guild.channels.cache.get(args[3])
        let role = await message.guild.roles.cache.get(args[4])
        await message.channel.send(`New sub entered! {Name: ${args[0]} ${args[1]} YTID: ${args[2]} Live Channel: ${liveChannel.toString()} Role Name: ${role.name}}`)
        
    }
}