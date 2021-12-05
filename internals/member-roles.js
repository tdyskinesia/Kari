const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');

const {inputMember, membershipRemove, automatedMembershipRemove, notifyUser} = require('./member-handler.js')


/**
 * @param  {Discord.Client} client
 * @param  {String} prefix
 */
module.exports = async(client, prefix) => {
    try{
        for await(const channel of member_channel.find().lean()){
            if(channel.verificationIDs!=null){
            let data = channel.verificationIDs
                for(var i in data){
                    let ch = client.channels.cache.get(channel.channelID)
                    let m = await ch.messages.fetch(data[i])
                    let d = new Date()
                    if(m.createdAt < d.setDate(d.getDate()-3)){
                        await member_channel.findOneAndUpdate({guildID: channel.guildID}, 
                        {
                            "$pull": {
                                "verificationIDs": data[i]
                            }
                        }
                        ).exec()
                    }
                }
            }
        }
    }
    catch (e){
        console.log(e)
    }

/**
 * @param  {Discord.Client} client
 */
const automatedMembershipIteration = async(client) => {
    try{
        for await (const mship of membership.find()){
            let date  = new Date()
            let d = new Date(mship.expiration)
            if(d<date&&mship.notifyFlag==false){
                console.log("Notifying user.")
                await notifyUser(await user.findOne({userID: mship.userID}), mship, client);
            }
            else if(date>d.setDate(d.getDate()+1)){
                await automatedMembershipRemove(mship, client);
            }
        }
    } catch (e){
    console.log(e)
}

}

setInterval(automatedMembershipIteration.bind(null, client), 1000 * 30)

automatedMembershipIteration(client)
/**
 * @param  {Discord.MessageReaction} reaction
 * @param  {Discord.User} user
 */
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    try{
    var mChannel = await member_channel.findOne({guildID: reaction.message.guild.id}).lean().exec()
        if(mChannel.channelID==reaction.message.channel.id){
            if(mChannel.verificationIDs.includes(reaction.message.id)){
                let member = reaction.message.guild.members.cache.get(user.id)
                if(member.permissions.has("BAN_MEMBERS")){
                    if (reaction.emoji.name === '❌') {
                        await reaction.message.channel.send(`${reaction.message.author.username}, ${user.username} has marked your membership application as invalid. Please review and resubmit.`)
                        // let member = await models.user.findOne({userID: reaction.message.author.id}).exec()
                        let args = reaction.message.content.slice(prefix.length).split(/ +/);
                            for await (const mship of membership.find({userID: reaction.message.author.id, talentName: {$regex: '.*' + args[1] + '.*', $options: 'i'}})){
                                automatedMembershipRemove(mship, client)
                            }
                    } else if (reaction.emoji.name === '✅'){
                        await reaction.message.channel.send(`${reaction.message.author.username}, ${user.username} has marked your membership as valid.`)
                        inputMember(await reaction.message.fetch(), reaction.message.author.id, user.id, prefix, client)
                        

                }
            
        }
    }
}
    } catch (e) {console.log(e)}
})

}