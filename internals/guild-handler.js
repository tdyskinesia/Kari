const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');
require('mongoose-long/index.js')(mongoose);
const {Types: {Long, Number, ObjectId}} = mongoose;

module.exports = {

    async setupGuild(message, args){
    try{
        let g = await new guild({
            guildID: message.guild.id,
            notificationsFlag: true,
            membership_IDs: [],
            user_IDs: [],
            talent_IDs: []
        }).save()
        if(args.includes("-n")){
            g.notificationsFlag = false
            await message.channel.send("Notifications flag set to false.")
        }
        await g.save()
        await message.channel.send("Guild set with " + args.length + " additional parameters.")
    } catch (e) {console.log(e)}
    }
}