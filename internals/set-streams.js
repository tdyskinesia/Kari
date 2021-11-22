const mongoose = require('mongoose');
        
const Discord = require('discord.js');

const talentSchema = require('../data/talentSchema');

const {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: "AIzaSyAGS-DmnHW9D1iC2L60GwwdSW_fc7SJqFk"
})

const https = require('https');

const { parse } = require('node-html-parser')
const fetch = require('node-fetch');
const { stream } = require('../data/talentSchema');

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

const checkHeader = async(ID, message) => {


    const response = await fetch(`https://youtube.com/channel/${ID}/live`)
    const text = await response.text()
    const html = parse(text, {blockTextElements: {
        script: true,	// keep text content when parsing
        noscript: true,	// keep text content when parsing
        style: true,		// keep text content when parsing
        pre: true			// keep text content when parsing
      }})
    console.log(html)
    const canonicalURLTag = html.querySelector('link[rel=canonical]')
    const streamTag = html.querySelector('.style-scope ytd-video-primary-info-renderer')
    const streamCheck = streamTag.getAttribute('Started Streaming')
    const canonicalURL = canonicalURLTag.getAttribute('href')
    const isStreaming = canonicalURL.includes('/watch?v=')
    await message.channel.send("href = "+canonicalURL + "\n" + streamCheck)
    return isStreaming;

        /*https.request(`https://www.youtube.com/channel/${ID}/live`, { method: 'HEAD' }, async(res) => {
            console.log(res.statusCode)
            await message.channel.send(`Status Code: ${res.statusCode.toString()} \nHeader Length: ${res.headers['content-length']}`)
            if(res.headers['content-length']>400000){
                bool = true
            } else bool = false;
            }).on('error', (err) => {
            console.error(err);
            }).end();*/
    
}

module.exports = {
    async queryTalents(message){

        for await (const talent of talentSchema.talent.find()){
            console.log(talent.youtubeID)
            talent.upcomingStreams = await youtube(talent)
            await message.channel.send(talent.name + ": " + talent.youtubeID +"\n" + talent.upcomingStreams)
            await talent.save();
        }
        console.log(talentSchema.talent.find())
        
    },
    getYoutubeLive(message) {
        const iterate = async() => {
            for await (const talent of talentSchema.talent.find()){
                if(await checkHeader(talent.youtubeID, message)){
                   message.channel.send(talent.name+ " is live");
                } else message.channel.send(talent.name+ " is not live");
            }
            setTimeout(iterate, 1000 * 30)
        }
        iterate()
    },
    async displayStreams(message){
        for await (const talent of talentSchema.talent.find({guildID: message.guild.id})){

        }
    }
}

