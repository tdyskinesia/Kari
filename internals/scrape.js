const  { parse } = require('node-html-parser')
const fetch = require ('node-fetch')
const webdriver = require('selenium-webdriver')
const chrome = require ('selenium-webdriver/chrome.js')
const DesiredCapabilities = require('selenium-webdriver/')
const {talent, stream, user, membership, member_channel, guild} = require('../data/models');
const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;
const UserAgent = require('user-agents')
// const SeleniumStealth = require("selenium-stealth");



const p = ['129.205.200.89:47309',
'111.231.86.149:7890',
'110.50.85.162:4145',
'176.114.228.40:44604',
'85.29.147.90:5678',
'77.242.28.123:4145',
'192.140.42.83:59057',
'95.80.182.76:5678',
'94.153.209.22:3629',
'14.63.228.239:80',
'200.0.227.220:4153',
'195.210.172.46:58350',
'185.46.170.253:4145',
'213.80.166.5:38442',
'62.248.101.5:5678',
'195.158.109.248:61531',
'138.99.93.227:4145',
'170.254.92.198:4153',
'194.233.69.41:443',
'222.252.21.100:5678',
'119.10.177.90:4145',
'195.168.91.238:4153',
'80.79.66.82:3629',
'131.108.60.22:3629',
'210.245.51.15:4145',
'148.251.0.157:9226',
'103.12.160.85:61928',
'189.52.165.134:1080',
'183.88.240.53:4145',
'185.51.92.84:51327']

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

//     const seleniumStealth = new SeleniumStealth(driver)
//     await seleniumStealth.stealth({
//     languages: ["en-US", "en"],
//     vendor: "Google Inc.",
//     platform: "Win32",
//     webglVendor: "Intel Inc.",
//     renderer: "Intel Iris OpenGL Engine",
//     fixHairline: true
// })
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

const iterateTalents = async(driver)=>{
    try{
        let strArr = []
        // let driver = await build()
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
            } 
            //else console.log("No upcoming or live stream for " + t.name)
        }
        
        return [strArr, driver]
    } catch (e){console.log(e)}
}
// setInterval(iterateTalents, 1000 * 100)
module.exports = {
    build: build,

    async f(driver){
        return await iterateTalents(driver)
    }

    
}
