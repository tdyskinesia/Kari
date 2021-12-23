const Discord = require('discord.js');

const Twitter = require('twitter-v2');

const {talent, space, stream, user, membership, member_channel, guild} = require('../data/models');

const mongoose = require('mongoose');

module.exports = {
    async addTwitter(twitterClient, message, args) 
    {
        try{
            if(args.length>2||args<2) {await message.channel.send("Format is [talent's first name] [twitter handle]. Incorrect number of args."); return}
            else
            {
                if(args[1].substring(0,1)==="@"){
                    args[1] = args[1].substring(1)
                }
                let { data } = await twitterClient.get('users/by', {usernames: args[1]})
                let tal = await talent.findOneAndUpdate({name:{ $regex: '.*'+ args[0] + '.*', $options: 'i' }, guildID: message.guild.id}, {"$set": {"twitterID" : data[0].id}}, {upsert: true}).lean().exec()
                if(tal==null) {await message.channel.send("Talent not found."); return}
                else
                {
                    message.channel.send("Twitter ID for " + tal.name + " set to " + data[0].id + ".")
                }
            }
        } catch (e) {console.log(e)}
    },
    async iterateTalents(client, twitterClient, guild)
    {   
        try{
            let idArr = []
            let tals = await talent.find({guildID: guild.guildID}).lean().exec()
            if(tals==null) return;
            for await(const tal of tals){
                if(tal.twitterID!=null)
                {
                    idArr.push(tal.twitterID)
                }
            }
            let query = idArr.join()
            console.log(query)
            // let {data} = await twitterClient.get('spaces/by/creator_ids', {user_ids: query})
            let {data} = await twitterClient.get('spaces/by/creator_ids', {user_ids: query, 'space.fields': 'title,creator_id'})
            console.log(data)
            
            let liveArr = []
            for await (const foundSpace of data){
                if(foundSpace.state=="live"){
                    liveArr.push(foundSpace.id)
                    for await(const tal of tals){
                        if(tal.twitterID!=null&&space.creator_id==tal.twitterID){
                            if(await space.findOne({talent_id: tal._id}).exec()==null){
                                s = await space.create({
                                    title: foundSpace.title,
                                    creator_id: foundSpace.creator_id,
                                    id: foundSpace.id,
                                    talent_id: tal._id
                                })
                            }
                        }
                    }
                }
            }
            let curGuild = await client.guilds.fetch(guild.guildID)

            for await (const foundSpace of space.find({id: {$nin: liveArr}})){
                let tal = await talent.findById(foundSpace.talent_id).lean().exec()
                if(tal.liveChannelID!=null){
                    let ch = await curGuild.channels.fetch(tal.liveChannelID)
                    if(ch.name.includes('🔊')){
                        await ch.setName('🛑'.concat(ch.name.substring(1)))
                    }
                }
            }
            await space.deleteMany({id: {$nin: liveArr}}).exec()

       
        } catch (e) {console.log(e)}
    }

}
