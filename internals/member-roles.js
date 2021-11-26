const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');

const {inputMember, membershipRemove, automatedMembershipRemove, notifyUser} = require('./member-handler.js')



module.exports = async(client, prefix) => {
for await(const channel of member_channel.find().lean()){
    let data = channel.verificationIDs
    for(var i in data){
        try{
        let ch = await client.channels.cache.get(channel.channelID)
        let m = await ch.messages.fetch(data[i], false)
        let d = new Date()
        if(m.createdAt < d.setDate(d.getDate()-7)){
            await member_channel.findOneAndUpdate({guildID: channel.guildID}, 
            {
                "$pull": {
                    "verificationIDs": data[i]
                }
            }
            ).exec()
        }
        }
        catch (e){
            console.log(e)
        }
    }
}

const iterateMembers = async(client) => {
    try{
        const date = new Date()
            for await (const member of user.find({memberships: { $exists: true }})){
                let memberships = member.memberships
                for (var i in memberships){
                    let membership = JSON.parse(JSON.stringify(memberships[i]))
                    if(membership.expirationDate<date&&!membership.notifyFlag){
                        console.log("Notifying user.")
                        notifyUser(member, membership, client)
                    }
                    else if(membership.expiration<date.setDate(date.getDate()+1)){
                        automatedMembershipRemove(member, membership, client)
                    }
                }
            }
    } catch (e){
    console.log(e)
}

}

setInterval(iterateMembers.bind(null, client), 1000 * 30)

iterateMembers(client)

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    var res = await member_channel.findOne({guildID: reaction.message.guild.id}).lean().exec()
        if(res.channelID==reaction.message.channel.id){
            if(res.verificationIDs.includes(reaction.message.id)){
            let member = reaction.message.guild.members.cache.get(user.id)
            if(member.permissions.has("BAN_MEMBERS")){
            if (reaction.emoji.name === '❌') {
                let mes = await reaction.message.fetch()
                await reaction.message.channel.send(`${reaction.message.author.toString()}, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
                let member = await models.user.find({guildID: reaction.message.guild.id ,userID: user.id}).exec()
                const args = reaction.message.content.slice(prefix.length).split(/ +/);
                let memberships = member.memberships
                for (var i in memberships){
                    let membership = JSON.parse(JSON.stringify(memberships[i]))
                    if(membership.talentName==args[1]){
                        automatedMembershipRemove(member, membership, client)
                    }
                }
            } else if (reaction.emoji.name === '✅'){
                await reaction.message.channel.send(`${reaction.message.author.toString()}, ${user.username} has marked your membership as valid.`)
                inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id, prefix, client)
                    

            }
        
    }
    }
}
})

}