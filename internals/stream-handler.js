const dotenv = require('dotenv');
dotenv.config(); 

const mongoose = require('mongoose');
        
const Discord = require('discord.js');

const models = require('../data/models');

const {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: process.env.YT_AUTH
})

const moment = require('moment-timezone')

const {Types: {ObjectId}} = require('mongoose')

// const https = require('https');

// const { parse } = require('node-html-parser')
// const fetch = require('node-fetch');
// const { stream } = require('../data/models');
// const cheerio = require('cheerio');

const youtube = async(talent) => {
    try {
    var results = []
    var streams = []
    var response = await yt.search.list({
        "part": [
            "id"
        ],
        "channelId": talent.youtubeID,
        "eventType": "upcoming",
        "order": "date",
        "type": [
        "video"
        ]
        });
        if(response.data.items[0]!=null){
        console.log("Response", response);
        for(var i in response.data.items){
            results.push(await yt.videos.list({
                "part": [
                "liveStreamingDetails, snippet"
            ],
            "id": [
                response.data.items[i].id.videoId
            ] 
            }))
            // console.log(results[i])
        }
        //sort by 
        results.sort(function(a, b) {
            return new Date(a.data.items[0].liveStreamingDetails.scheduledStartTime) - new Date(b.data.items[0].liveStreamingDetails.scheduledStartTime);
          });

        
        //for (var i in results){console.log(results[i].data.items[0].liveStreamingDetails.scheduledStartTime) }
        let now = new Date()
        let maxD = new Date()
        maxD.setMonth(maxD.getMonth()+6)
        let strArr = models.stream.find()
        for await (const index of results){
        let strD = new Date(index.data.items[0].liveStreamingDetails.scheduledStartTime)
                //return([results[index].data.items[0].liveStreamingDetails.scheduledStartTime, results[index].data.items[0].snippet.title, results[index].data.items[0].id, results[index].data.items[0].snippet.thumbnails.default.url])
            if(strD > now && strD < maxD){
            await models.stream.deleteMany({videoID: index.data.items[0].id}).exec()
            let newStream = await models.stream.create({
                    streamName: index.data.items[0].snippet.title,
                    startTime: index.data.items[0].liveStreamingDetails.scheduledStartTime,
                    videoID: index.data.items[0].id,
                    thumbnailUrl: index.data.items[0].snippet.thumbnails.high.url,
                    talent_id: ObjectId(talent._id)
                })
            streams.push(newStream._id)
            }
        } 
        return streams
    } else {return []}
} catch(e) {console.log(e)}

}

const channelInfo = async(talent)=>{
    var response = await yt.channels.list({
        "part": [
            "snippet"
        ],
        "id": [
            talent.youtubeID
          ]
        });
    return response.data.items[0].snippet.thumbnails.high.url

}


module.exports = {
    async bupdate(client, bool, message, args){
        try{
        if(args==null) args=[]

        const channel = await client.channels.cache.get('908671236895305760')
        const guild = await models.guild.findOne({guildID: '835723287714857031'})
        let embedArray = []
        if(args.length==0){
        if(message!=null) await message.channel.send("Updating board now!")
        for await (const talent of models.talent.find({guildID: '835723287714857031', youtubeID: {$exists: true}}).sort({order: 1})){
            let fieldArray = []
            if(bool==true){
            await youtube(talent)
            await talent.save();
            let profileURL = await channelInfo(talent)
            await models.talent.findByIdAndUpdate(talent._id, {"$set": {profileURL: profileURL}}, {upsert: true})
            
        }
            let streams = await models.stream.find({talent_id: talent._id}).sort({startTime: 1}).lean().exec()
            if(streams.length>0){
                let counter = 0
                let liveBool = false
                    for await (const stream of streams){
                        if(stream.dStart!=null){
                            let curStart = moment(stream.dStart)
                            liveBool = true
                            fieldArray.push({
                                name: stream.streamName,
                                value: "**Currently Live!**\n"+
                                curStart.tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('America/New_York').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('Asia/Tokyo').format('MM/DD/YYYY HH:mm z') + "\n"+
                                "[**Come Watch With Us!**](https://www.youtube.com/watch?v=" + stream.videoID +")"
                            })
                        }
                    }
                    for await (const stream of streams){  
                        if(stream.startTime!=null){
                        let curStart = moment(stream.startTime)
                        
                        fieldArray.push({
                            name: stream.streamName,
                            value: "In "+ (Math.round(Math.abs(new Date()-new Date(stream.startTime))/3600000)) + " Hours\n"+
                            curStart.tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('America/New_York').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('Asia/Tokyo').format('MM/DD/YYYY HH:mm z') + "\n"+
                            "[**Waiting Room**](https://www.youtube.com/watch?v=" + stream.videoID +")"
                        })
                    }
                
                    }
                
            if(liveBool==false){
                embedArray.push(new Discord.MessageEmbed({
                    type: "rich",
                    title: "UPCOMING STREAMS",
                    color: '2b7d14',
                    fields: fieldArray,
                    footer: {
                        text: 'Updated at'
                    },
                    thumbnail:{
                        url: talent.profileURL
                    },
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                }).setTimestamp())
            } else {
                embedArray.push(new Discord.MessageEmbed({
                    type: "rich",
                    title: "LIVE NOW",
                    color: 'ff0074',
                    fields: fieldArray,
                    footer: {
                        text: 'Updated at'
                    },
                    thumbnail:{
                        url: talent.profileURL
                    },
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                }).setTimestamp())
            }
        } else {
                embedArray.push(new Discord.MessageEmbed({
                    type: "rich",
                    title: "UPCOMING STREAM",
                    color: '911c1c',
                    description: "NO UPCOMING STREAM FOUND",
                    footer: {
                        text: 'Updated at'
                    },
                    thumbnail:{
                        url: talent.profileURL
                    },
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                }).setTimestamp())
        }
            await talent.save();
        }
        // const messages = await channel.messages.fetch({limit: 100})
        // .then(async(msgs)=> {
        //     if(msgs!=null){
        //         return await msgs.forEach(async(msg)=>{
        //             if(msg.author.id===client.user.id){
        //                 await msg.delete()
        //             }
        //         })
        //     }
        //     }).catch((e)=>{
        //         console.log(e)
        //     })
        //     if(embedArray.length>10){
        //         for(let i = 0; i <= (embedArray.length/10)+1; i+=10){
        //             if (i==(embedArray.length/10)+1){
        //                 await channel.send({embeds: embedArray.slice(i)})
        //             } else {
        //             await channel.send({embeds: embedArray.slice(i, i+9)})
        //             }
        //         }
        //     } else {
        //     await channel.send({embeds: embedArray})
        //     }
        // }
        //check if we can edit the previous message(s). if not, resets.
        let bm = []
        if(guild.boardMessage==null||guild.boardMessage.length==0)
        {
            if(embedArray.length>10){
                for(let i = 0; i <= embedArray.length; i+=10){
                    if (embedArray.length-i<10){
                        bm.push((await channel.send({embeds: embedArray.slice(i)})).id)

                    } else {
                    bm.push((await channel.send({embeds: embedArray.slice(i, i+9)})).id)
                    }
                }
            } else {
            bm.push((await channel.send({embeds: embedArray})).id)
            }
            await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()       
        } 
        else 
        {
            let bool = true
            for await (const b of guild.boardMessage){
                try
                {
                    if(await channel.messages.fetch(b)==null){
                        bool=false
                    }
                }
                catch (e)
                {
                    console.log(e)
                    bool = false
                }
            }
            if(bool)
            {
                if(guild.boardMessage.length==1)
                {
                    let m = await channel.messages.fetch(guild.boardMessage[0])
                    await m.edit({embeds: embedArray})

                }
                else if(guild.boardMessage.length>1)
                {
                    if(embedArray.length>10){
                        if(Math.ceil(embedArray.length/10)==guild.boardMessage.length){
                            let c = 0
                            for(let i = 0; i <= embedArray.length; i+=10){
                                if (embedArray.length-i<10){
                                    await (await channel.messages.fetch(guild.boardMessage[c])).edit({embeds: embedArray.slice(i)})
                                    c++

                                } else {
                                await (await channel.messages.fetch(guild.boardMessage[c])).edit({embeds: embedArray.slice(i, i+9)})
                                c++
                                }
                            }
                        } else {
                            const messages = await channel.messages.fetch({limit: guild.boardMessage.length})
                            if(messages!=null){
                                    await messages.forEach(async(msg)=>{
                                        if(msg.author.id===client.user.id){
                                            await msg.delete()
                                        }
                                    })
                                }
                            for(let i = 0; i <= embedArray.length; i+=10){
                                if (embedArray.length-i<10){
                                bm.push((await channel.send({embeds: embedArray.slice(i)})).id)

                                } else {
                                bm.push((await channel.send({embeds: embedArray.slice(i, i+9)})).id)
                                }
                            }
                            await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                        }
                    } else {
                    const messages = await channel.messages.fetch({limit: guild.boardMessage.length})
                    if(messages!=null){
                            await messages.forEach(async(msg)=>{
                                if(msg.author.id===client.user.id){
                                    await msg.delete()
                                }
                            })
                        }
                    bm.push((await channel.send({embeds: embedArray})).id)
                    await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                    }          
                }
            }
            else
            {
                const messages = await channel.messages.fetch({limit: 100})
                if(messages!=null){
                        await messages.forEach(async(msg)=>{
                            if(msg.author.id===client.user.id){
                                await msg.delete()
                            }
                        })
                    } 

                if(embedArray.length>10){
                for(let i = 0; i <= embedArray.length; i+=10){
                    if (embedArray.length-i<10){
                    bm.push((await channel.send({embeds: embedArray.slice(i)})).id)

                    } else {
                    bm.push((await channel.send({embeds: embedArray.slice(i, i+9)})).id)
                    }
                }
                await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                } else {
                bm.push((await channel.send({embeds: embedArray})).id)
                await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                }
            }
        }
        }
    } catch(e) {console.log(e)}
        
    },
    /**
     * @param  {Discord.Client} client
     * @param  {mongoose.Query} guild
     * @param  {Boolean} bool
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async publicBoard(client, guild, bool, message, args){
        try{
        if(args==null) args=[]
        const curGuild = await client.guilds.fetch(guild.guildID)
        const channel = curGuild.channels.resolve(guild.boardChannelID)
        let embedArray = []
        if(message!=null) await message.channel.send("Updating board now!")
        for await (const talent of models.talent.find({guildID: guild.guildID, youtubeID: {$exists: true}})){
            if(bool){
            let profileURL = await channelInfo(talent)
            await models.talent.findByIdAndUpdate(talent._id, {"$set": {profileURL: profileURL}}, {upsert: true})
            }
            let stream = await models.stream.findOne({talent_id: talent._id, dStart: {$exists: true}})
            if(stream==null) 
            {
                stream = await models.stream.findOne({talent_id: talent._id}).sort({startTime: 1})
                if(stream==null) 
                {
                    embedArray.push(new Discord.MessageEmbed({
                        type: "rich",
                        title: "No Upcoming Stream Found",
                        color: '911c1c',
                        footer: {
                            text: 'Updated at'
                        },
                        
                        author: {
                            name: talent.name,
                            url: `https://www.youtube.com/channel/${talent.youtubeID}`,
                            icon_url: talent.profileURL
                        }
                    }).setTimestamp())
                }
                else
                {
                    let curStart = moment(stream.startTime)
                    //upcoming
                    embedArray.push(new Discord.MessageEmbed({
                        type: "rich",
                        title: stream.streamName,
                        color: '2b7d14',
                        description: "**In "+ (Math.round(Math.abs(new Date()-new Date(stream.startTime))/3600000)) + " Hours**\n",
                        fields: [
                            {
                                name: "PST",
                                value: "*["+curStart.tz('America/Los_Angeles').format('MM/DD/YYYY hh:mm')+"]*",
                                inline: true
                              },
                              {
                                name: "EST",
                                value: "*["+curStart.tz('America/New_York').format('MM/DD/YYYY hh:mm')+"]*",
                                inline: true
                              },
                              {
                                name: "JST",
                                value: "*["+curStart.tz('Asia/Tokyo').format('MM/DD/YYYY HH:mm')+"]*",
                                inline: true
                              },
                              {
                                name: "\u200B",
                                value: stream.description
                              },
                        ],
                        footer: {
                            text: 'Updated at'
                        },
                        image: {
                            url: stream.thumbnailUrl
                        },
                        author: {
                            name: talent.name,
                            url: `https://www.youtube.com/channel/${talent.youtubeID}`,
                            icon_url: talent.profileURL
                        },
                        url: "https://www.youtube.com/watch?v="+stream.videoID
                    }).setTimestamp())
                }
            }
            else
            {
                let curStart = moment(stream.dStart)
                //live now
                embedArray.push(new Discord.MessageEmbed({
                    type: "rich",
                    title: stream.streamName,
                    color: 'ff0074',
                    description: "Live Now!",
                    fields: [
                        {
                          name: "PST",
                          value: "*["+curStart.tz('America/Los_Angeles').format('MM/DD/YYYY hh:mm')+"]*",
                          inline: true
                        },
                        {
                          name: "EST",
                          value: "*["+curStart.tz('America/New_York').format('MM/DD/YYYY hh:mm')+"]*",
                          inline: true
                        },
                        {
                          name: "JST",
                          value: "*["+curStart.tz('Asia/Tokyo').format('MM/DD/YYYY HH:mm')+"]*",
                          inline: true
                        },
                        {
                          name: "\u200B",
                          value: stream.description
                        },
                    ],
                    footer: {
                        text: 'Updated at'
                    },
                    image: {
                        url: stream.thumbnailUrl
                    },
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`,
                        icon_url: talent.profileURL
                    },
                    url: "https://www.youtube.com/watch?v="+stream.videoID
                }).setTimestamp())
            }
                
            await talent.save();
        }
        //check if we can edit the previous message(s). if not, resets.
        let bm = []
        if(guild.boardMessage==null||guild.boardMessage.length==0)
        {
            if(embedArray.length>10){
                for(let i = 0; i <= embedArray.length; i+=10){
                    if (embedArray.length-i<10){
                        bm.push((await channel.send({embeds: embedArray.slice(i)})).id)

                    } else {
                    bm.push((await channel.send({embeds: embedArray.slice(i, i+9)})).id)
                    }
                }
            } else {
            bm.push((await channel.send({embeds: embedArray})).id)
            }
            await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()       
        } 
        else 
        {
            let bool = true
            for await (const b of guild.boardMessage){
                try
                {
                    if(await channel.messages.fetch(b)==null){
                        bool=false
                    }
                }
                catch (e)
                {
                    console.log(e)
                    bool = false
                }
            }
            if(bool)
            {
                if(guild.boardMessage.length==1)
                {
                    let m = await channel.messages.fetch(guild.boardMessage[0])
                    await m.edit({embeds: embedArray})

                }
                else if(guild.boardMessage.length>1)
                {
                    if(embedArray.length>10){
                        if(Math.ceil(embedArray.length/10)==guild.boardMessage.length){
                            let c = 0
                            for(let i = 0; i <= embedArray.length; i+=10){
                                if (embedArray.length-i<10){
                                    await (await channel.messages.fetch(guild.boardMessage[c])).edit({embeds: embedArray.slice(i)})
                                    c++

                                } else {
                                await (await channel.messages.fetch(guild.boardMessage[c])).edit({embeds: embedArray.slice(i, i+9)})
                                c++
                                }
                            }
                        } else {
                            const messages = await channel.messages.fetch({limit: guild.boardMessage.length})
                            if(messages!=null){
                                    await messages.forEach(async(msg)=>{
                                        if(msg.author.id===client.user.id){
                                            await msg.delete()
                                        }
                                    })
                                }
                            for(let i = 0; i <= embedArray.length; i+=10){
                                if (embedArray.length-i<10){
                                bm.push((await channel.send({embeds: embedArray.slice(i)})).id)

                                } else {
                                bm.push((await channel.send({embeds: embedArray.slice(i, i+9)})).id)
                                }
                            }
                            await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                        }
                    } else {
                    const messages = await channel.messages.fetch({limit: guild.boardMessage.length})
                    if(messages!=null){
                            await messages.forEach(async(msg)=>{
                                if(msg.author.id===client.user.id){
                                    await msg.delete()
                                }
                            })
                        }
                    bm.push((await channel.send({embeds: embedArray})).id)
                    await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                    }          
                }
            }
            else
            {
                const messages = await channel.messages.fetch({limit: 100})
                if(messages!=null){
                        await messages.forEach(async(msg)=>{
                            if(msg.author.id===client.user.id){
                                await msg.delete()
                            }
                        })
                    } 

                if(embedArray.length>10){
                for(let i = 0; i <= embedArray.length; i+=10){
                    if (embedArray.length-i<10){
                    bm.push((await channel.send({embeds: embedArray.slice(i)})).id)

                    } else {
                    bm.push((await channel.send({embeds: embedArray.slice(i, i+9)})).id)
                    }
                }
                await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                } else {
                bm.push((await channel.send({embeds: embedArray})).id)
                await models.guild.findByIdAndUpdate(guild._id, {"$set" : {'boardMessage' : bm}}, {upsert: true}).exec()  
                }
            }
        }
        
    } catch(e) {console.log(e)}
        
    },
    async editBoard(client, guild, message, args) {
    try{
        const curGuild = await client.guilds.fetch(guild.guildID)
        const channel = curGuild.channels.resolve(guild.boardChannelID)


    } catch (e) {console.log(e)}
    },
    async queryTalents(message, client) {
        let guild = await client.guilds.cache.get(message.guild.id)
            for await (const talent of models.talent.find({guildID: message.guild.id})){
                let str = "Name: "+talent.name+ " "
                if(talent.youtubeID){
                    str+="YoutubeID: " + talent.youtubeID+" "
                }
                if(talent.liveChannelID){   
                    str+="Live Channel: " + (await client.channels.cache.get(talent.liveChannelID)).toString()+ " "
                }
                if(talent.roleID){
                    str+="Notification Role: " + (await guild.roles.cache.get(talent.roleID)).name + " "
                }
                if(talent.memberRoleID){
                    str+="Member Role: " + (await guild.roles.cache.get(talent.memberRoleID)).name + " "
                }
                if(talent.twitterID){
                    str+="Twitter ID: " + talent.twitterID+ " "
                }
                await message.channel.send(str)
            //     if(talent.memberRoleID){
            //     await message.channel.send(
            //    `NAME: ${talent.name} YTID: ${talent.youtubeID} LIVE CHANNEL: ${(await client.channels.cache.get(talent.liveChannelID)).toString()} ROLE: ${(await guild.roles.cache.get(talent.roleID)).name} MEMBER ROLE: ${(await guild.roles.cache.get(talent.memberRoleID)).name}`)
            //     } else {
            //         await message.channel.send(
            //             `*Name:* ${talent.name} YTID: ${talent.youtubeID} LIVE CHANNEL: ${(await client.channels.cache.get(talent.liveChannelID)).toString()} ROLE: ${(await guild.roles.cache.get(talent.roleID)).name}`)
            //     }
            }
    },
    async displayStreams(message){
        let strArr = []
        for await (const talent of models.talent.find({guildID: message.guild.id})){
            if(talent.streams.length>0){
                for(var i in talent.streams){
                    strArr.push(await models.stream.findById(talent.streams[i]).lean().exec())
                }
                let s = strArr.join("\n ")
                await message.channel.send(talent.name + ":\n" + s.substring(0, s.length-1))
            } else {
                await message.channel.send(talent.name + ":\nNo Upcoming Streams Found")
            }
        }
    },
    async timeChange(message, args){
        for await (const talent of models.talent.find({guildID: message.guild.id})){
            for await(const stream_id of talent.streams){
                let stream = await models.stream.findById(stream_id).exec()
                if(stream.videoID==args[0]){
                    await message.channel.send("Original ISO: "+stream.startTime)
                    let curDate = new Date(stream.startTime)
                    curDate.setMinutes(curDate.getMinutes() + parseInt(args[1]))
                    stream.startTime = curDate.toISOString()
                    await stream.save()
                    await message.channel.send("Changed ISO: " + stream.startTime)
                }
            }
        }
    },
    async displayLive(message){
        try{ 
            let a = await models.stream.find({guildID: message.guild.id, dStart: {$exists: true}}).lean().exec()
            let embedArr = []
            for await(const stream of a){
                let tal = await models.talent.findOne({_id: stream.talent_id, guildID: message.guild.id}).lean().exec()
                if(tal!=null){
                    if(stream.thumbnailUrl!=null&&stream.description!=null)
                    {
                        embedArr.push(new Discord.MessageEmbed({
                            type: "rich",
                            title: stream.streamName,
                            description: stream.description,
                            color: "e6a595",
                            image: {
                                url: stream.thumbnailUrl
                            },
                            author: {
                                name: tal.name,
                                icon_url: tal.profileURL,
                                url: "https://www.youtube.com/channel/"+tal.youtubeID
                            },
                            url: "https://www.youtube.com/watch?v="+stream.videoID
                        }))
                        // strArr.push((await models.talent.findById(stream.talent_id)).name+": "+stream.streamName + " <https://www.youtube.com/watch?v="+stream.videoID+">" +
                        // stream.thumbnailUrl)
                    } 
                    else 
                    {
                        embedArr.push(new Discord.MessageEmbed({
                            type: "rich",
                            title: stream.streamName,
                            color: "e6a595",
                            author: {
                                name: tal.name,
                                icon_url: tal.profileURL,
                                url: "https://www.youtube.com/channel/"+tal.youtubeID
                            },
                            url: "https://www.youtube.com/watch?v="+stream.videoID
                        }))
                    // strArr.push((await models.talent.findById(stream.talent_id)).name+": "+stream.streamName + " <https://www.youtube.com/watch?v="+stream.videoID+">")
                    }
                }
            }
            
            message.channel.send({embeds: embedArr})
        } catch (e) {console.log(e)}
    
    }     

}

