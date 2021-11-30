const  { parse } = require('node-html-parser')
const fetch = require ('node-fetch')
const webdriver = require('selenium-webdriver')
const chrome = require ('selenium-webdriver/chrome.js')
const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;
const UserAgent = require('user-agents')
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

const agent = new UserAgent(/Chrome/, {platform: 'Win32', deviceCategory: 'desktop'})

const build = async()=>{
    try{
    let np = p[Math.random()*(1 - 30) + 1]
    let newAgent = agent.random();
    //initialize build
    const opt = new chrome.Options()
    //.setChromeBinaryPath('C:/Program Files (x86)/Google/Chrome/Application/chrome.exe')
    .addArguments([
        '--disable-gpu', 
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--headless',
        //'--remote-debugging-port=5554',
        //'--whitelisted-ips',
        '--user-agent=' + newAgent.toString()])
        //'--proxy-server=http://'+ np])
    
    //var driver = chrome.Driver.createSession(opt, new chrome.ServiceBuilder().build());
    let driver = await new webdriver.Builder()
    .withCapabilities({
        'goog:chromeOptions': {
            excludeSwitches: [
                'enable-automation',
                'useAutomationExtension',
            ],
        },
    })
    .forBrowser('chrome')
    .setChromeOptions(opt)
    .build();
    return driver
    } catch (e) {console.log(e)}
}
/**
 * @param  {webdriver.WebDriver} driver
 * @param  {String} url
 */
const getPage = async(driver, url)=>{
    try{
    //fetch page
    await driver.get(url)
    await driver.manage().deleteAllCookies()
    await driver.sleep(1000)
    //scrape
    let el = await driver.wait(webdriver.until.elementLocated(webdriver.By.css("#info-text")), 8000)
    //el = await driver.wait(webdriver.until.elementLocated(webdriver.By.xpath(`/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/h1/yt-formatted-string`)), 8000)

    inner = await el.getText()
    if(inner.includes("Started streaming")){
        let t = await driver.wait(webdriver.until.elementLocated(webdriver.By.css("#container > h1 > yt-formatted-string")), 8000)
        console.log(await t.getText())
        //let t = await driver.wait(webdriver.until.elementLocated(webdriver.By.xpath(`/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/h1/yt-formatted-string`)), 8000)
        //console.log(await t.getText())
        // let a = (await t.getText()).split('\n')[0]
        // if (a.includes("#")) a = (await t.getText()).split('\n')[1]
        return await t.getText()
    } else {
        return null;
    }
} catch(e) {console.log(e)}
    // "#info-contents>#container>h1>yt-formatted-string"
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
                console.log(str.snippet.title + ": " + str.id)
                for await(const name of names){
                    console.log(name[1].substring(name[1].length-11))
                    if(name[1].substring(name[1].length-11)==str.id){
                        finArr.push([name[0], str.snippet.title, name[1], str.snippet.thumbnails.maxres.url])
                        console.log(name[0], str.snippet.title, str.id, str.snippet.thumbnails.maxres.url)
                    }
                }
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
module.exports = {
    build: build,

    async f(){
        return await iterateTalents()
    }

    
}
