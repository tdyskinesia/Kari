const Discord = require('discord.js');

const talentSchema = require('../data/models');

const mongoose = require('mongoose');


module.exports = {
    async deleteTalent(message, args){
        talentSchema.talent.deleteMany({youtubeId: args[0], guildID: message.guild.id}).then(async function(){
            await message.channel.send("All records deleted.");
        }).catch(function(error){
            console.log(error);
        });

    }

}