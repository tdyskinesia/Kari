const mongoose = require('mongoose');
        
const Discord = require('discord.js');

const talentSchema = require('../data/talentSchema');

const {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: "AIzaSyAGS-DmnHW9D1iC2L60GwwdSW_fc7SJqFk"
})

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
            if(new Date(results[index].data.items[0].liveStreamingDetails.scheduledStartTime) > now){
                //return([results[index].data.items[0].liveStreamingDetails.scheduledStartTime, results[index].data.items[0].snippet.title, results[index].data.items[0].id, results[index].data.items[0].snippet.thumbnails.default.url])
                return(talentSchema.stream({
                    streamName: results[index].data.items[0].snippet.title,
                    startTime: results[index].data.items[0].liveStreamingDetails.scheduledStartTime,
                    videoID: results[index].data.items[0].id,
                    thumbnailUrl: results[index].data.items[0].snippet.thumbnails.default.url
                }).save())
            } 

        } 
    } else {return null}

}

module.exports = {
    async ex(message){

        for await (const talent of talentSchema.talent.find()){
            console.log(talent.youtubeID)
            talent.upcomingStream = await youtube(talent)
            await message.channel.send(talent.name + ": " + talent.youtubeID +"\n" + talent.upcomingStream.streamName + " " + talent.upcomingStream.startTime)
        }
        console.log(talentSchema.talent.find())
        
    },
    query: queryAllUsers()
}

