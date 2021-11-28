const  { parse } = require('node-html-parser')
const fetch = require ('node-fetch')
const webdriver = require('selenium-webdriver')
const chrome = require ('selenium-webdriver/chrome.js')
const {talent, stream, user, membership, member_channel, guild} = require('../data/models');



const ex = async(talent)=>{
    //fetch live redirect
    const response = await fetch(`https://youtube.com/channel/${talent[1]}/live`)
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
        if(await build(canonicalURL)){
            console.log(talent[0] + " IS CURRENTLY STREAMING AT\n" + canonicalURL)
        } else {
            console.log(talent[0] + " IS NOT LIVE")
        }
        
    }
}



const build = async(url)=>{
    //initialize build
    const opt = new chrome.Options()
    .setChromeBinaryPath('C:/Program Files (x86)/Google/Chrome/Application/chrome.exe')
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
    
    //fetch page
    await driver.get(url)

    //scrape
    el = await driver.wait(webdriver.until.elementLocated(webdriver.By.css("#info-text"), 5000))

    inner = await el[0].getText()
    if(inner.includes("Started streaming")){
        await driver.quit()
        console.log(inner)
        return true;
    } else {
        await driver.quit()
        console.log(inner)
        return false;
    }
              
}

module.exports =  {

}
