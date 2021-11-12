module.exports = {
    name: 'b',
    description: "Embed",
    execute(message, args){
    var startTimes = [];
    var streamLinks = [];
    var streamIDs = ['UCKJexadCeNo3lu0U20skmNg', 'UCu1INzefw3R7M9-3QEHYmMQ', 'UCoAw3SML_09dF-7yhQU8wFQ', 'UCuaDidGk4HNLOnQE9wzMMeQ'];
    const {google} = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
        '728142197994-ps5mak4so8fd9urhgatb3sejcaor16g3.apps.googleusercontent.com',
        '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',
        'http://localhost:8000');

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
          
        // If you only need one scope you can pass it as a string
        scope: "https://www.googleapis.com/auth/youtube.force-ssl"
        });    
    
    google.options({
        auth: oauth2Client
    });
    const yt = google.youtube({
        version: 'v3',
        auth: "AIzaSyDgRAgUtiUmPxF-az5HpTpLU6TnhxokU_4"
    })
    
    for(var r in streamIDs){
      var c = 0;
      var link = "";
      yt.search.list({
        "part": [
            "id"
          ],
        "channelId": streamIDs[r],
        "eventType": "upcoming",
        "type": [
          "video"
        ]
        }).then(function(response) {
          console.log("Response", response);
          //for(var i in response.data.items) 
          //{c++}
          if (response.data.items[0]!=null){
          console.log(response.data.pageInfo[0]);
          link = response.data.items[c].id.videoId;
          streamLinks.push("https://www.youtube.com/watch?v="+link);
          yt.videos.list({
            "part": [
                "liveStreamingDetails"
              ],
              "id": [
                link
              ]
        }).then(function(response2) {
            console.log("Response2", response2);
            
            startTimes.push(response2.data.items[0].liveStreamingDetails.scheduledStartTime);
            console.log(startTimes);
            if(r == 4){
              console.log('DONE');
              for(var p in startTimes){
                message.channel.send(streamLinks[p] + "\n" + startTimes[p]);
                console.log(startTimes[p]);
          
                }
            }
          
          },
          function(err) { console.error("Execute error", err); });  
          
          }
        },
        function(err) { console.error("Execute error", err); });
      }
    


    }
}