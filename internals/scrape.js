const  { parse } = require('node-html-parser')
const fetch = require ('node-fetch')
const webdriver = require('selenium-webdriver')
const chrome = require ('selenium-webdriver/chrome.js')
const DesiredCapabilities = require('selenium-webdriver/')
const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;
const UserAgent = require('user-agents')
const SeleniumStealth = require("selenium_stealth");

module.exports = async() => {

const p = ['88.135.45.75:4153',
'203.207.56.220:5678',
'217.218.242.75:5678',
'182.61.32.240:8001',
'159.223.85.16:1080',
'171.35.165.185:8085',
'58.219.91.253:8118',
'176.88.209.158:1080',
'95.0.206.21:10800',
'193.59.26.95:4153',
'79.132.202.84:4145',
'159.146.126.154:8080',
'159.146.126.156:8080',
'192.111.137.34:18765',
'14.226.87.178:5678',
'65.21.183.114:3232',
'184.82.48.89:5678',
'168.138.198.222:1080',
'67.201.33.9:25280',
'195.201.77.126:8080',
'223.112.146.107:9999',
'223.112.146.106:9797',
'223.112.146.108:9999',
'58.17.108.119:8085',
'190.115.219.78:8080',
'159.146.126.133:8080',
'159.146.126.131:8080',
'159.146.126.130:8080',
'159.146.126.137:8080',
'159.146.126.135:8080']

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

const user = new UserAgent(/Chrome/, {platform: 'Win32', deviceCategory: 'desktop'})

const build = async()=>{
    try{
    let np = p[Math.random()*(1 - 30) + 1]
    let newAgent = user.random();
    //initialize build
    const opt = new chrome.Options()
    //.setChromeBinaryPath('C:/Program Files (x86)/Google/Chrome/Application/chrome.exe')
    .addArguments([
        '--disable-gpu', 
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--headless',
        '--remote-debugging-port=5554',
        '--whitelisted-ips',
        '--user-agent=' + newAgent.toString(),
        '--proxy-server=http://'+ np])

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

    const seleniumStealth = new SeleniumStealth(driver)
    await seleniumStealth.stealth({
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
    platform: "Win32",
    webglVendor: "Intel Inc.",
    renderer: "Intel Iris OpenGL Engine",
    fixHairline: true
})
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

    //scrape
    // let el = await driver.wait(webdriver.until.elementLocated(webdriver.By.css("#info-text")), 5000)
    let el = await driver.wait(webdriver.until.elementLocated(webdriver.By.xpath(`/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/h1/yt-formatted-string`)), 8000)
    // console.log(await el.getText())

    inner = await el.getText()
    if(inner.includes("Started streaming")){
        let t = await driver.wait(webdriver.until.elementLocated(webdriver.By.xpath(`/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/h1/yt-formatted-string`)), 8000)
        // console.log(await t.getText())
        // let a = (await t.getText()).split('\n')[0]
        // if (a.includes("#")) a = (await t.getText()).split('\n')[1]
        return await t.getText()
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
                // console.log(t.name + " in")
                let title = await getPage(driver, url)
                // console.log(t.name + " out")
                if(title!=null){
                    // console.log(t.name + " pushed")
                    strArr.push([t.name, title, url])
                }
            } 
            //else console.log("No upcoming or live stream for " + t.name)
        }
        
        await driver.quit()
        return strArr
    } catch (e){console.log(e)}
}
// setInterval(iterateTalents, 1000 * 100)

return await iterateTalents();


}
