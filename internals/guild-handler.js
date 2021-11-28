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
            })
            if(args.includes("-n")){
                await guild.findOneAndUpdate({guildID: message.guild.id}, {'$set': {"notificationsFlag": false}}).exec()
                await message.channel.send("Notifications flag set to false.")
            }
            await message.channel.send("Guild set with " + args.length + " additional parameters.")
        } else message.channel.send("Guild already set.")
    } catch (e) {console.log(e)}
    },
    async boosterRoleSet(message, args){
        try{
            if(args.length<2){
                if (args.length==1){
                    let g = guild.findOneAndUpdate({guildID: message.guild.id}, {'$set':{"boosterRoleID": args[0]}}, {upsert: true}).exec()
                    if(g!=null) message.channel.send("Booster role set.")
                    else message.channel.send("Guild not found.")
                } else {
                    let g = guild.findOneAndUpdate({guildID: message.guild.id}, {'$unset':{"boosterRoleID": ""}}, {upsert: true}).exec()
                    if(g!=null) message.channel.send("Booster role removed")
                    else message.channel.send("Guild not found.")
                }
            } else message.channel.send("Too many args.")
        } 
        catch(e) {
            console.log(e)
        }
    },
    /**
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async setIcon(message, args){
    if(message.member.roles.cache.has((await guild.findOne({guildID: message.guild.id}).exec()).boosterRoleID)||message.member.permissions.has("BAN_MEMBERS")){
        var image = message.attachments
        if(image.first()!=null){
        var link = image.first().url

            if(image.first().size<256000){

                if(message.member.roles.cache.has(args[0])&&message.member.roles.highest===message.member.roles.cache.get(args[0])){

                    if(message.guild.me.roles.highest.comparePositionTo(message.member.roles.cache.get(args[0]))>0){

                const role = await message.guild.roles.fetch(args[0])
                await role.setIcon(link)
                message.channel.send("Role Icon Set")

                    } else {
                        message.channel.send("Role is out of Kari's permission range.")
                    }

                } else {
                    message.channel.send("You do not have that role ID, or it was not your highest role.")
                }

            } else {
                message.channel.send("Image file size error (over 256kb).")
            }
        } else { message.channel.send("No file found.") }
    } else message.channel.send("You are not boosting the server, are not a mod, or a booster role was not set for this server.")

    }
}