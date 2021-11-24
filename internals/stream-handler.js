const mongoose = require('mongoose');
        
const Discord = require('discord.js');

const talentSchema = require('../data/talentSchema');

const {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: "AIzaSyBPY0_LA0G7jd3o2YH22SVxfLESjxTTvRA"
})

const https = require('https');

const { parse } = require('node-html-parser')
const fetch = require('node-fetch');
const { stream } = require('../data/talentSchema');
const cheerio = require('cheerio');

//unused
const queryAllUsers = () => {
    //Where User is you mongoose user model
    talentSchema.talent.find({} , (err, talents) => {
        if(err) //do something...

        talents.map(talent => {
            console.log(talent.youtubeID)
        })
    })
}

const youtube = async(talent) => {
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
            console.log(results[i])
        }
        //sort by 
        results.sort(function(a, b) {
            return new Date(a.data.items[0].liveStreamingDetails.scheduledStartTime) - new Date(b.data.items[0].liveStreamingDetails.scheduledStartTime);
          });

        
        for (var i in results){console.log(results[i].data.items[0].liveStreamingDetails.scheduledStartTime) }
        now = new Date()
        for (var index in results){
                //return([results[index].data.items[0].liveStreamingDetails.scheduledStartTime, results[index].data.items[0].snippet.title, results[index].data.items[0].id, results[index].data.items[0].snippet.thumbnails.default.url])
            if(new Date(results[index].data.items[0].liveStreamingDetails.scheduledStartTime) > now){
            streams.push(talentSchema.stream({
                    streamName: results[index].data.items[0].snippet.title,
                    startTime: results[index].data.items[0].liveStreamingDetails.scheduledStartTime,
                    videoID: results[index].data.items[0].id,
                    thumbnailUrl: results[index].data.items[0].snippet.thumbnails.default.url
                }))
            }
        } 
        return streams;
    } else {return []}

}


module.exports = {
    async bupdate(client, message){
        const channel = await client.channels.cache.get('908671236895305760')
        let embedArray = []
        
        if(message != null){
            await message.channel.send("Updating Board Now!")
        }

        for await (const talent of talentSchema.talent.find({guildID: '835723287714857031'})){
            let fieldArray = []
            console.log(talent.youtubeID)
            talent.upcomingStreams = await youtube(talent)
            if(talent.upcomingStreams.length>0){
                talent.upcomingStreams.forEach(async function(stream){
                    fieldArray.push({
                        name: stream.streamName,
                        value: "In "+ (Math.round(Math.abs(new Date()-new Date(stream.startTime))/3600000)) + " Hours\n**Waiting Room**\n" + "https://www.youtube.com/watch?v=" + stream.videoID
                    })
                });
                embedArray.push({
                    type: "rich",
                    title: "UPCOMING STREAMS",
                    color: '2b7d14',
                    fields: fieldArray,
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                })
        } else {
                embedArray.push({
                    type: "rich",
                    title: "UPCOMING STREAM",
                    color: '911c1c',
                    description: "NO UPCOMING STREAM FOUND",
                    author: {
                        name: talent.name,
                        url: `https://www.youtube.com/channel/${talent.youtubeID}`
                    }
                })
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
        
    },
    async queryTalents(message, client) {
        let guild = await client.guilds.cache.get(message.guild.id)
            for await (const talent of talentSchema.talent.find({guildID: message.guild.id})){
                await message.channel.send(
               `NAME: ${talent.name} 
                YTID: ${talent.youtubeID}
                LIVE CHANNEL: ${(await client.channels.cache.get(talent.liveChannelID)).toString()}
                ROLE:${(await guild.roles.cache.get(talent.roleID)).name}`)
            }
    },
    async displayStreams(message){
        for await (const talent of talentSchema.talent.find({guildID: message.guild.id})){
            if(talent.upcomingStreams.length>0){
                await message.channel.send(talent.name + ":\n" + talent.upcomingStreams)
            } else {
                await message.channel.send(talent.name + ":\nNo Upcoming Streams Found")
            }
        }
    },
    async timeChange(message, args){
        await talentSchema.stream.find({videoID: args[0]}, async (res, err) => {
            for await(var i of res){
                await message.channel.send("Original ISO: "+res[i].startTime)
                let curDate = new Date(res[i].startTime)
                curDate.setMinutes(curDate.getMinutes() + parseInt(args[1]))
                res[i].startTime = curDate.toISOString()
                await res[i].save()
                await message.channel.send("Changed ISO: " + res[i].startTime)
            }
            if(err){
                console.log(err)
            }
        })
    }

}

