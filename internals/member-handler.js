const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const mongoose = require('mongoose');

const inputMember = async(subTalent, message, args) => {
    let inputMembership = new membership({
        talentName: subTalent.name,
        expiration: args[1],
        staffID: ''
    })
}

module.exports = {
    async subChannel(message, args){
        let targetChannel = await message.guild.channels.cache.get(args[0])
            if(args.length==1){
            args[0].replace(/\D/g,'')
            await member_channel.findOne({guildID: message.guildId}, (err, res)=>{
                if(err) {console.log(err)}
                if(!res){
                    member_channel.create({
                        guildID: message.guildId,
                        channelID: args[0]
                    }, function(err, channel){
                        if(err) {console.log(err)}
                    })
                    await message.channel.send(`No sub found. Sub created in ${targetChannel.toString()}.`)
                } else {
                    let prev = await message.guild.channels.cache.get(res.channelID)
                    res.channelID = args[0]
                    await message.channel.send(`Previous sub found at ${prev.toString()}. Changed member channel sub to ${targetChannel.toString()}.`)
                }
            })
        } else { message.channel.send("Too many arguments or no argument found for channel sub.") }
    },

    async callSub(message, args) {
        talent.findOne({guildID: message.guildId, name:{ $regex: args[0], $options: 'i' } }, (err, res)=>{
            if(err) console.log(err)
            if(res){
                await member_channel.findOne({guildID: message.guildId}, (err, res)=>{
                    if(err) {console.log(err)}
                    if(res){
                        res.reactionCollectors.push(new Discord.MessageCollector(message))
                        await message.channel.send(`Request to member to ${args[0]}`)
                    } else {
                        await message.channel.send("")
                    }

                })
                //await inputMember(res, message, args)
            } else {
                await message.channel.send("Talent not found subbed in your server.")
            }
        })



        /*user.findOne({userID: message.author.id}, (err, res)=>{
            if (!res){
                
                user.create({
                    memberships: [membership({})]
                        
                    
                }, function(err, user){
                    if (err) return handleError(err);
                })
            } else {

            }
        })*/


    }
}