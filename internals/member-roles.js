const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const mongoose = require('mongoose');

const {inputMember} = require('./member-handler.js')

module.exports = async(client) => {
let arr = []
for await(const channel of member_channel.find().lean()){
    let data = channel.verificationIDs
    for(var i in data){
        arr.push(await (await client.channels.cache.get(channel.channelID)).messages.fetch(data[i], false))
        console.log(data[i])
    }
}
return arr;



}