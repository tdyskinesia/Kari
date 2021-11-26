const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const mongoose = require('mongoose');

const {inputMember} = require('./member-handler.js')

module.exports = async(client) => {
let arr = []
for await(const channel of member_channel.find().lean()){
    let data = channel.verificationIDs
    for(var i in data){
        try{
        let ch = await client.channels.cache.get(channel.channelID)
        await ch.messages.fetch(data[i], false)
        console.log(data[i])
        }
        catch (e){
            console.log(e)
        }
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    console.log(reaction.message.id)
    var res = await member_channel.findOne({guildID: reaction.message.guildId}).lean().exec()
    console.log(res)
        if(res.channelID==reaction.message.channel.id){
            let arr = []
            console.log(res.verificationIDs)
            for(const i of res.verificationIDs){
                console.log(i)
                arr.push(i);
            }
            if(arr.includes(reaction.message.id)){
            let member = reaction.message.guild.members.cache.get(user.id)
            if(member.permissions.has("BAN_MEMBERS")){
            if (reaction.emoji.name === '❌') {
                await reaction.message.channel.send(`${reaction.message.author.toString()}, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
            } else if (reaction.emoji.name === '✅'){
                await reaction.message.channel.send(`${reaction.message.author.toString()}, ${user.username} has marked your membership as valid.`)
                inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id, prefix)

            }
        }
    }
    }
    
})

}