const  { parse } = require('node-html-parser')
const fetch = require ('node-fetch')
const webdriver = require('selenium-webdriver')
const chrome = require ('selenium-webdriver/chrome.js')
const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;

module.exports = async() => {

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



const build = async()=>{
    try{
    //initialize build
    const opt = new chrome.Options()
    //.setChromeBinaryPath('C:/Program Files (x86)/Google/Chrome/Application/chrome.exe')
    .addArguments([
        '--disable-gpu', 
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--headless',
        '--remote-debugging-port=9994',
        '--whitelisted-ips'])

    //var driver = chrome.Driver.createSession(opt, new chrome.ServiceBuilder().build());
    let driver = await new webdriver.Builder()
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

    //scrape
    let el = await driver.wait(webdriver.until.elementLocated(webdriver.By.css("#info-text")), 5000)
    console.log(await el.getText())

    inner = await el.getText()
    if(inner.includes("Started streaming")){
        let t = await driver.wait(webdriver.until.elementLocated(webdriver.By.css("#info-contents")), 5000)
        console.log(await t.getText())
        let a = (await t.getText()).split('\n')[0]
        if (a.includes("#")) a = (await t.getText()).split('\n')[1]
        return a
    } else {
        return null;
    }
} catch(e) {console.log(e)}
    // "#info-contents>#container>h1>yt-formatted-string"
}
const iterateTalents = async()=>{
    try{
        let strArr = []
        let driver = await build()
        for await(const t of talent.find({youtubeID: {$exists: true}})){
            let url = await ex(t)
            if(url!=null){
                console.log(t.name + " in")
                let title = await getPage(driver, url)
                console.log(t.name + " out")
                if(title!=null){
                    console.log(t.name + " pushed")
                    strArr.push([t.name, title, url])
                }
            } else console.log("No upcoming or live stream for " + t.name)
        }
        
        await driver.quit()
        return strArr
    } catch (e){console.log(e)}
}
// setInterval(iterateTalents, 1000 * 100)

return await iterateTalents();


}
