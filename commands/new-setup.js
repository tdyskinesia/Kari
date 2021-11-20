module.exports = {
    name: 'new setup',
    description: "new setup for mongodb",
    async execute(message, args){
        const mongoose = require('mongoose');
        
        const Discord = require('discord.js');

        const talentSchema = require('../data/talentSchema');
   
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
        
    }
}