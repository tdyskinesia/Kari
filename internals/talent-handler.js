const Discord = require('discord.js');

const talentSchema = require('../data/models');

const mongoose = require('mongoose');


module.exports = {
    async deleteTalent(message, args){
        talentSchema.talent.deleteMany({name: {$regex: ".*"+args[0]+ ".*", $options: 'i'}, guildID: message.guild.id}).then(function(){
            message.channel.send("All records deleted.");
        }).catch(function(error){
            console.log(error);
        });

    }

}