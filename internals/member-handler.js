const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const mongoose = require('mongoose');

const findTalentName = async(talentName, guildID) => {
    talent.findOne({guildID: guildID, name:{ $regex: '.*'+ talentName + '.*', $options: 'i' } }, (err, res)=>{
        if(err) {console.log(err)}
        if(res){
        console.log(res.name)
        return res.name;
        }
    })
}

const insertTalentMembership = async (guildID, talentName, inputMembership) => {
    talent.findOneAndUpdate({guildID: guildID, name: talentName}, 
        {
            '$push' : {
                "memberships" : inputMembership
            }
        },
        {
            new: true,
            upsert: true
        },
        (err, res) => {
            if(err) {console.log(err)}
            console.log("NEW MEMBERSHIP ARRAY FOR " + talentName)
        })
}

// const filter = async(reaction, user) => {
//     let member = await reaction.message.guild.members.cache.get(user.id)
//     return (reaction.emoji.name === '❌'|| reaction.emoji.name === '✅')&&member.permissions.has("BAN_MEMBERS")
// }

const inputMember = async(message, authorID, staff) => {
    let args = message.content.slice(prefix.length).split(/ +/)
    let guildID = await message.guild.id
    console.log(guildID +  " "  + args[1])
    let talentName = await findTalentName(args[1], guildID)
    let inputMembership = new membership({
        talentName: talentName,
        expiration: new Date(args[2]),
        staffID: staff
    })
    await insertTalentMembership(guildID, talentName, inputMembership)
    user.findOne({userID: message.author.id}, async (err, res) => {
        if (!res){ 
            user.create({
                memberships: [inputMembership],
                userID: message.author.id,
                guildID: guildID
            }, async (err, res) => {
                if(err) { console.log(err) }
                await message.channel.send(`User created with their first membership to ${talentName}! Thanks ${(await message.guild.members.cache.get(authorID)).user.username}!`)
            })
        } else {
            user.findOneAndUpdate({guildID: message.guildId, userID: message.author.id },
            {
                '$push': {
                    "memberships" : inputMembership
                }
            },
            {
                new: true,
                upsert: true
            },
             (err, res)=>{
                if(err) {console.log(err)}
            })
            await message.channel.send(`Added a membership to ${talentName} for ${(await message.guild.members.cache.get(authorID)).user.username}!`)
        }
    });

}

// const collectors = []

// const checkCollectors = async() => {
//     console.log(collectors)
//     for (const collector of collectors){
//         console.log(collector)    
//         if(collector.total>0){
//             collector.collected.forEach(async(res)=>{
//                 if(res.reaction.emoji.name === '❌'){
//                     await res.reaction.channel.send(`<@&${collector.message.author.id}>, a staff member has marked your 
//                     membership application as invalid. Please review and resubmit.`)
//                 }
//             })
//             let staff = await collector.collected.first().reaction.users.cache.first().id
//             let authorID = await collector.message.author.id
//             let message = await collector.message.fetch()
//             inputMember(message, authorID, staff)
//         }
//     }
// }


module.exports = {
    async subChannel(message, args){
        let targetChannel = await message.guild.channels.cache.get(args[0])
            if(args.length==1){
            args[0].replace(/\D/g,'')
            member_channel.findOne({guildID: message.guildId}, async(err, res)=>{
                if(err) {console.log(err)}
                if(!res){
                    member_channel.create({
                        guildID: message.guildId,
                        channelID: args[0]
                    }, function(err, channel){
                        if(err) {console.log(err)}
                    })
                    await message.channel.send(`No sub found. Sub created in ${targetChannel.toString()}.`)
                } else {
                    let prev = await message.guild.channels.cache.get(res.channelID)
                    member_channel.findOneAndUpdate({_id: res._id},
                        {
                            '$set' : {
                                "channelID" : args[0]
                            }
                        },
                        {
                            new: true
                        },
                        async (err, res) => {
                            if(err) console.log(err)
                        })
                    await message.channel.send(`Previous sub found at ${prev.toString()}. Changed member channel sub to ${targetChannel.toString()}.`)
                }
            })
        } else { message.channel.send("Too many arguments or no argument found for channel sub.") }
    },

    async callSub(message, args) {
        talent.findOne({guildID: message.guildId, name:{ $regex: args[0], $options: 'i' } }, async(err, res)=>{
            if(err) console.log(err)
            if(res){
                member_channel.findOne({guildID: message.guildId}, async(err, res)=>{
                    if(err) {console.log(err)}
                    if(res){
                        member_channel.findOneAndUpdate({_id: res._id},
                            {
                                '$push' : {
                                    "verificationIDs" : message.id
                                }
                            }, 
                            {   
                                new: true,
                                upsert: true
                            },
                            async(err, res)=>{
                                if(err) console.log(err)
                                await message.channel.send(message.id + " added to collection stack.")
                            })
                        await message.channel.send(`Request to member to ${args[0]} recieved.`)
                        message.react('✅')
                        message.react('❌')
                    } else {
                        await message.channel.send("No membership verification channel set!")
                    }

                })
                //await inputMember(res, message, args)
            } else {
                await message.channel.send("Talent not found subbed in your server.")
            }
        })
    },
    async subMemberRole(message, args){
        if(args.length==2){
            talent.findOneAndUpdate({guildID: message.guildId, name:{ $regex: args[0], $options: 'i' }},
            {
                '$set': {
                    "memberRoleID" : args[1]
                }
            },
            {
                new: true,
                upsert: true
            },
            async (err, res) => {
                if(err) console.log(err)
                await message.channel.send(res.name + "member role set to " + (await message.guild.roles.cache.get(res.memberRoleID)).name)
            })

        } else message.channel.send("Too many or no arguments")
    },

    async iterateCollectors(){
        await checkCollectors()
        console.log("COLLECTORS CHECKED")
    },
    async inputMember(message, authorID, staff, prefix) {
    let args = message.content.slice(prefix.length).split(/ +/)
    let guildID = await message.guild.id
    console.log(guildID +  " "  + args[1])
    let talentName = await findTalentName(args[1], guildID)
    let inputMembership = new membership({
        talentName: talentName,
        expiration: new Date(args[2]),
        staffID: staff
    })
    await insertTalentMembership(guildID, talentName, inputMembership)
    user.findOne({userID: message.author.id}, async (err, res) => {
        if (!res){
            user.create({
                memberships: [new membership({
                    talentName: talentName,
                    expiration: new Date(args[2]),
                    staffID: staff
                })],
                userID: message.author.id,
                guildID: guildID
            }, async (err, res) => {
                if(err) { console.log(err) }
                await message.channel.send(`User created with their first membership to ${talentName}! Thanks ${(await message.guild.members.cache.get(authorID)).user.username}!`)
            })
        } else {
            user.findOneAndUpdate({guildID: message.guildId, userID: message.author.id },
            {
                '$push': {
                    "memberships" : inputMembership
                }
            },
            {
                new: true,
                upsert: true
            },
             (err, res)=>{
                if(err) {console.log(err)}
            })
            await message.channel.send(`Added a membership to ${talentName} for ${(await message.guild.members.cache.get(authorID)).user.username}!`)
        }
    });
    
    }
}