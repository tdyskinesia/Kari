module.exports = {
  name: 'ping',
  description: "Embed",
  execute(message, args){
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
  
    var c = 0;
    var link = "";
    yt.search.list({
      "part": [
          "id"
        ],
      "channelId": "UCu-J8uIXuLZh16gG-cT1naw",
      "eventType": "upcoming",
      "type": [
        "video"
      ]
      }).then(function(response) {
        console.log("Response", response);
        for(var i in response.data.items) 
        {c++}
         c--;   
        link = response.data.items[c].id.videoId;
        yt.videos.list({
          "part": [
              "liveStreamingDetails"
            ],
            "id": [
              link
            ]
      }).then(function(response) {
          console.log("Response", response);
          
          message.channel.send(response.data.items[0].liveStreamingDetails.scheduledStartTime);
        },
        function(err) { console.error("Execute error", err); });  
        
        message.channel.send("https://www.youtube.com/watch?v="+link);
      },
      function(err) { console.error("Execute error", err); });
  }
}
