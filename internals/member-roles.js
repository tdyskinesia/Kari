const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const mongoose = require('mongoose');

const {inputMember} = require('./member-handler.js')

module.exports = async(client) => {

for await(const channel of member_channel.find().lean()){
    let data = channel.verificationIDs
    for(var i in data){
        await (await client.channels.cache.get(channel.channelID)).messages.fetch(data[i])
        console.log(data[i])
    }
}


client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    console.log(reaction.message.id)
    member_channel.findOne({guildID: reaction.message.guildId}, async(err, res)=>{
        if(err) console.log(err)
        if(res.channelID==reaction.message.channel.id){
            if (reaction.emoji.name === '❌') {
                await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
            } else if (reaction.emoji.name === '✅'){
                await reaction.message.channel.send(`<@&${reaction.message.author.id}>, ${user.username} has marked your membership as valid.`)
                inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id)

            }
        }
    })
})

}