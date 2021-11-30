const  { parse } = require('node-html-parser')
const fetch = require ('node-fetch')
const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;
const {google} = require('googleapis');
const yt = google.youtube({
    version: 'v3',
    auth: process.env.YT_AUTH2
})


const ex = async(talent)=>{
    try{
    //fetch live redirect
    const response = await fetch(`https://youtube.com/channel/${talent.youtubeID}/live`)
    const text = await response.text()
    const html = parse(text, {blockTextElements: {
        script: true,	
        noscript: true,	
        style: true,		
        pre: true			
      }})
    //scrape for video id
    const canonicalURLTag = html.querySelector('link[rel=canonical]')
    //get link
    const canonicalURL = canonicalURLTag.getAttribute('href')
    const isStreaming = canonicalURL.includes('/watch?v=')
    if(isStreaming){
        //pass stream into selenium
        return canonicalURL
    } else return null
} catch (e) {console.log(e)}
}


/**
 * @param  {Array<Array<String>>} names
 * @param  {Array<String>} url
 */
const vidInfo = async(names, url) => {
    try{
        let vidIDs = []
        let titArr = []
        let finArr = []
        for await (const i of url){
            vidIDs.push(i.substring(i.length-11))
        }
        vidIDs.join()
        var response = await yt.videos.list({
            "part": ["snippet", "liveStreamingDetails"],
            "id": vidIDs
        })
        for await(const str of response.data.items){
            let curStreamDetails = JSON.stringify(str.liveStreamingDetails)
            if(curStreamDetails.includes("actualStartTime")&&!curStreamDetails.includes("actualEndTime")){
                //titArr.push([str.snippet.title, str.id])
                //console.log(str.snippet.title + ": " + str.id)
                for await(const name of names){
                    //console.log(name[1].substring(name[1].length-11))
                    if(name[1].substring(name[1].length-11)==str.id){
                        finArr.push([name[0], str.snippet.title, name[1], str.snippet.thumbnails.maxres.url, str.snippet.description.substring(0, 150)+ "..."])
                        //console.log(name[0], str.snippet.title, str.id, str.snippet.thumbnails.maxres.url, str.snippet.description)
                    }
                }
            } else if (curStreamDetails.includes("scheduledStartTime")){
                await stream.findOneAndUpdate({videoID: str.id}, {startTime: str.liveStreamingDetails.scheduledStartTime}).lean().exec()
            }
        }
        return finArr

    } catch(e) {console.log(e)}
}


const iterateTalents = async()=>{
    try{
        let url = []
        let names = []
        let titArr = []
        // let driver = await build()
        for await(const t of talent.find({youtubeID: {$exists: true}})){
            let curUrl = await ex(t)
            if(curUrl!=null){
                url.push(curUrl)
                names.push([t.name, curUrl])
            } else console.log("No upcoming or live stream for " + t.name)
        }

            // let title = await getPage(driver, url)
        titArr = await vidInfo(names, url)
        
        //else console.log("No upcoming or live stream for " + t.name)
        
        
        return titArr
    } catch (e){console.log(e)}
}
// setInterval(iterateTalents, 1000 * 100)
module.exports = async()=>{

return await iterateTalents()
    
}

