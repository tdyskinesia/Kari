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

        
        for (var i in results){console.log(results[i].data.items[0].liveStreamingDetails.scheduledStartTime) }
        now = new Date()
        let strArr = models.stream.find()
        for await (const index of results){
                //return([results[index].data.items[0].liveStreamingDetails.scheduledStartTime, results[index].data.items[0].snippet.title, results[index].data.items[0].id, results[index].data.items[0].snippet.thumbnails.default.url])
            if(new Date(index.data.items[0].liveStreamingDetails.scheduledStartTime) > now){
            let newStream = await models.stream.create({
                    streamName: index.data.items[0].snippet.title,
                    startTime: index.data.items[0].liveStreamingDetails.scheduledStartTime,
                    videoID: index.data.items[0].id,
                    thumbnailUrl: index.data.items[0].snippet.thumbnails.high.url,
                    talent_id: ObjectId(talent._id)
                })
            await models.stream.deleteMany({videoID: index.data.items[0].id}).exec()
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
    async bupdate(client, message, args){
        if(args==null) args=[]
        const channel = await client.channels.cache.get('908671236895305760')
        let embedArray = []
        if(args.length==0){
        if(message!=null) await message.channel.send("Updating board now!")
        for await (const talent of models.talent.find({guildID: '835723287714857031'})){
            let fieldArray = []
            talent.streams = await youtube(talent)
            let profileURL = await channelInfo(talent)
            await talent.save();
            if(talent.streams.length>0){
                for await (const i of talent.streams){
                    let stream = await models.stream.findById(i).exec()
                    let curStart = moment(stream.startTime)
                    fieldArray.push({
                        name: stream.streamName,
                        value: "In "+ (Math.round(Math.abs(new Date()-new Date(stream.startTime))/3600000)) + " Hours\n"+
                        curStart.tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('America/New_York').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('Asia/Tokyo').format('MM/DD/YYYY HH:mm z') + "\n"+
                        "[**Waiting Room**](https://www.youtube.com/watch?v=" + stream.videoID +")"
                    })
                }

                embedArray.push(new Discord.MessageEmbed({
                    type: "rich",
                    title: "UPCOMING STREAMS",
                    color: '2b7d14',
                    fields: fieldArray,
                    footer: {
                        text: 'Updated at:'
                    },
                    thumbnail:{
                        url: profileURL
                    },
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                }).setTimestamp())
        } else {
                embedArray.push(new Discord.MessageEmbed({
                    type: "rich",
                    title: "UPCOMING STREAM",
                    color: '911c1c',
                    description: "NO UPCOMING STREAM FOUND",
                    footer: {
                        text: 'Updated at:'
                    },
                    thumbnail:{
                        url: profileURL
                    },
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                }).setTimestamp())
        }
            await talent.save();
        }
        const messages = await channel.messages.fetch({limit: 100})
        .then(async(msgs)=> {
                return await msgs.forEach(async(msg)=>{
                    if(msg.author.id===client.user.id){
                        await msg.delete()
                    }
                })
            }).catch((e)=>{
                console.log(e)
            })
            if(embedArray.length>10){
                for(let i = 0; i <= (embedArray.length/10)+1; i+=10){
                    if (i==(embedArray.length/10)+1){
                        await channel.send({embeds: embedArray.slice(i)})
                    } else {
                    await channel.send({embeds: embedArray.slice(i, i+9)})
                    }
                }
            } else {
            await channel.send({embeds: embedArray})
            }
        } else if (args[0]==='-o'){
            let embedArray = []
            await message.channel.send("Updating Board without Calling API")
            for await (const curTalent of models.talent.find({guildID: message.guild.id})){
                let fieldArray = []
                if(curTalent.streams.length>0){
                    curTalent.streams.forEach(async function(stream_id){
                        let stream = await models.stream.findById(stream_id).exec()
                        let curStart = moment(stream.startTime)
                        fieldArray.push({
                            name: stream.streamName,
                            value: "In "+ (Math.round(Math.abs(new Date()-new Date(stream.startTime))/3600000)) + " Hours\n"+
                            curStart.tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('America/New_York').format('MM/DD/YYYY HH:mm z') + " | " + curStart.tz('Asia/Tokyo').format('MM/DD/YYYY HH:mm z') + "\n"+
                            "[**Waiting Room**](https://www.youtube.com/watch?v=" + stream.videoID +")"
                        })
                    });
                    embedArray.push(new Discord.MessageEmbed({
                        type: "rich",
                        title: "UPCOMING STREAMS",
                        color: '2b7d14',
                        fields: fieldArray,
                        footer: {
                            text: 'Updated at:'
                        },
                        //no thumbnail until they're stored in database
                        author: {
                            name: curTalent.name,
                            url: `https://www.youtube.com/channel/${curTalent.youtubeID}`
                        }
                    }).setTimestamp())
            } else {
                    embedArray.push(new Discord.MessageEmbed({
                        type: "rich",
                        title: "UPCOMING STREAM",
                        color: '911c1c',
                        description: "NO UPCOMING STREAM FOUND",
                        footer: {
                            text: 'Updated at:'
                        },

                        author: {
                            name: curTalent.name,
                            url: `https://www.youtube.com/channel/${curTalent.youtubeID}`
                        }
                    }).setTimestamp())
            }
            
            }
            if(embedArray.length>10){
                for(let i = 0; i <= (embedArray.length/10)+1; i+=10){
                    if (i==(embedArray.length/10)+1){
                        await message.channel.send({embeds: embedArray.slice(i)})
                    } else {
                    await message.channel.send({embeds: embedArray.slice(i, i+9)})
                    }
                }
            } else {
            await message.channel.send({embeds: embedArray})
            }
        }
        
    },
    async queryTalents(message, client) {
        let guild = await client.guilds.cache.get(message.guild.id)
            for await (const talent of models.talent.find({guildID: message.guild.id})){
                if(talent.memberRoleID){
                await message.channel.send(
               `NAME: ${talent.name} YTID: ${talent.youtubeID} LIVE CHANNEL: ${(await client.channels.cache.get(talent.liveChannelID)).toString()} ROLE: ${(await guild.roles.cache.get(talent.roleID)).name} MEMBER ROLE: ${(await guild.roles.cache.get(talent.memberRoleID)).name}`)
                } else {
                    await message.channel.send(
                        `NAME: ${talent.name} YTID: ${talent.youtubeID} LIVE CHANNEL: ${(await client.channels.cache.get(talent.liveChannelID)).toString()} ROLE: ${(await guild.roles.cache.get(talent.roleID)).name}`)
                }
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
    }

}

