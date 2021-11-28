const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');
require('mongoose-long/index.js')(mongoose);
const {Types: {Long, Number, ObjectId}} = mongoose;

module.exports = {

    async setupGuild(message, args){
    try{
            if((await guild.findOne({guildID: message.guild.id}).exec())==null){
            await guild.create({
                guildID: message.guild.id,
                notificationsFlag: true,
                membership_IDs: [],
                user_IDs: [],
                talent_IDs: []
            }).save()
            if(args.includes("-n")){
                await guild.findOneAndUpdate({guildID: message.guild.id}, {'$set': {"notificationsFlag": false}}).exec()
                await message.channel.send("Notifications flag set to false.")
            }
            await message.channel.send("Guild set with " + args.length + " additional parameters.")
        } else message.channel.send("Guild already set.")
    } catch (e) {console.log(e)}
    }
}