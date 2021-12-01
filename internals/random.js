const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');

const links = ['https://cdn.discordapp.com/attachments/838711689125822477/915727304448180264/Q1Py2nQf0bqgAAAABJRU5ErkJggg.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915726397773864970/5Nvazj3Xm76v8D6QjQgeyaNJ6AAAAAElFTkSuQmCC.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727233686044693/IyAAAAAAAACH5BAEAAAYALAAAAAAQAAwAAAM9SLbU3ssQ4IS91oEAgChgGHaBEQRCIILqGRHfIMqF8sb0QNvMt4Y8ie9XiwgLqlAyCGOdksUbERSUPK6RBAA7.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727367807307776/hLnXxIlbrmrfW8yAAAAAElFTkSuQmCC.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727413994983444/zJkBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMBAgMCGoyPaQAafNpLUrqLs2Y8crs4oEaWptll1ngWADs.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727457187926016/vT0nX24d1XbbKv4DcrBqDnWDV8AAAAASUVORK5CYII.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727549978509352/8A1MMuNN3Dr9cAAAAASUVORK5CYII.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727600515694602/7qe1Gcv4viMBuMjKlb9dt1fCKPb3VAAAAABJRU5ErkJggg.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727678894661681/gPLf1V8zc0OYuA4jzQAAAABJRU5ErkJggg.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727896256073738/5KU6rgU1b0AAAAASUVORK5CYII.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915727988153253918/HsKWfKD7LZcF6QdTuHyaBmiq0gAAAABJRU5ErkJggg.png',
'https://cdn.discordapp.com/attachments/838711689125822477/915728268169187378/ImWfwSnPRnfhtcAAAAAElFTkSuQmCC.png']

/**
 * @param  {Discord.Client} client
 */
module.exports = {
    async mood(message){
        await message.channel.send(links[links.length * Math.random() | 0])
        await message.channel.send("Mood.")
        return;
    },
    /**
     * @param  {Discord.Client} client
     */
    async kari(client) {
        client.on("messageCreate", async(message) =>{
            if(message.guild==null) return;
            if(message.guild.id!='835723287714857031') return;
            if(message.partial) await message.fetch();
            if(message.author.bot) return;
            if(!message.guild) return;
            if(message.content.toLowerCase().includes("kari")){
                
                if((Math.random() * (Math.floor(35) - Math.ceil(1)) + Math.ceil(1))==15){
                    message.channel.send("You guys talking about me?")
                } 
            }
            if(message.content=="<a:AruruPepeKekShake:908620454338641920>"){
                let bool = true
                let messages = await message.channel.messages.fetch({limit: 3})
                if(messages!=null){
                    messages.forEach(async(msg)=>{
                        if(msg.content!="<a:AruruPepeKekShake:908620454338641920>"){
                            bool = false
                        }
                    })
                    if(bool){
                        message.channel.send("<a:AruruPepeKekShake:908620454338641920>")
                    }
                }
            }
        })
    }


}