const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel} = require('../data/models');

const mongoose = require('mongoose');

const findTalentName = async(talentName, guildID) => {
    try{
    var q = await talent.findOne({guildID: guildID, name:{ $regex: '.*'+ talentName + '.*', $options: 'i' } }).lean().exec()
    if(q){
        return q.name
        } else return null
    }
    catch (e){
        console.log(e)
    }

}

const insertTalentMembership = async(guildID, talentName, inputMembership) => {
    try{
    let tal = await talent.findOneAndUpdate({guildID: guildID, name: talentName}, 
        {
            '$push' : {
                "memberships" : inputMembership
            }
        }).lean().exec()
    let newTal = await talent.findById(tal._id).lean().exec()
    if(newTal.memberships.length>tal.memberships.length){
        return true
    } else return false
    }catch (e){
        console.log(e)
    }
}

const memberRoleAssign = async(userID, talentName, guildID, client) => {
    let tal = await talent.findOne({guildID: guildID, name:{ $regex: talentName, $options: 'i' }}).lean().exec()
    if(!tal.memberRoleID) return false;
    try{
    let roleID = tal.memberRoleID
    let guild = client.guilds.cache.get(guildID)
    await guild.members.fetch(userID)
    .then((member)=>{
        rolesInit = member.roles.length
        if(!member.roles.cache.has(roleID)){
            member.roles.add(roleID)
            .then((res)=>
            {
                console.log(res)
                return true
            })
            .catch((err) => {
                console.log(err)
                return false
            })
        } else {
            console.log(member.user.username + " already had Role: " + member.roles.cache.get(roleID))
            return false
        }
    })
    .catch((err)=>{
        console.log(err)
        return false
    })
    }
    catch (e) {
        console.log(e)
        return  false
    }
    
}


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
    //adds a membership request to queue
    //called when k!member <talent> <date> is called by user
    async callSub(message, args) {
        if(message.attachments.size>0){
        if(args.length==2){
        talent.findOne({guildID: message.guildId, name:{ $regex: args[0], $options: 'i' } }, async(err, res)=>{
            if(err) console.log(err)
            if(res){
                if(res.memberRoleID){
                member_channel.findOne({guildID: message.guildId}, async(err, res)=>{
                    if(err) {console.log(err)}
                    if(res){
                        if(res.channelID==message.channel.id){
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
                        } else message.channel.send("Request recieved from outside of verification channel " + message.guild.channels.cache.get(res.channelID).toString())
                    } else {
                        await message.channel.send("No membership verification channel set!")
                    }

                })
            } else {
                await message.channel.send("Talent does not have member role set.")
            }
            } else {
                await message.channel.send("Talent not found subbed in your server.")
            }
            
            })
        } else await message.channel.send("No args or too many args given")
    } else message.channel.send("No attachment found")
    },
    //adds member role to talent
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
                await message.channel.send(res.name + " member role set to " + (await message.guild.roles.cache.get(res.memberRoleID)).name)
            })

        } else message.channel.send("Too many or no arguments")
    },
    //creates a membership for a member
    //called from reaction event
    async inputMember(message, authorID, staff, prefix, client) {
    var args = message.content.slice(prefix.length).split(/ +/)
    var guildID = message.guild.id
    console.log(guildID +  " "  + args[1])
    var talentName = await findTalentName(args[1], guildID)
    var exDate = new Date(args[2])
    var inputMembership = new membership({
        talentName: talentName,
        expiration: exDate,
        staffID: staff,
        userID: message.author.id
    })
    console.log(talentName)
    let talBool = await insertTalentMembership(guildID, talentName, inputMembership)
    user.findOne({userID: message.author.id}, async (err, res) => {
        if (!res){
            user({
                memberships: [new membership({
                    talentName: talentName,
                    expiration: exDate,
                    staffID: staff,
                    userID: message.author.id
                })],
                userID: message.author.id,
                guildID: guildID
            }).save()
            await message.channel.send(`User created with their first membership to ${talentName}! Thanks ${(await message.guild.members.cache.get(authorID)).user.username}!`)
            return await memberRoleAssign(authorID, talentName, guildID, client);
            
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
            return await memberRoleAssign(authorID, talentName, guildID, client);
        }
    });
    
    },
    //gets all of memberships for the user that called the command
    async getMemberships(message, args) {
        var me = await user.findOne({guildID: message.guild.id, userID: message.author.id}).lean().exec()
        if(me){
            me.memberships.forEach(async function(membership){
                await message.channel.send(membership.talentName + " " + membership.expiration + " (Verified by: "+ (await message.guild.members.cache.get(membership.staffID)).user.username+ ")")
            })
        } else {
            message.channel.send("No memberships found.")
        }
    },
    //clears member role for given talent if no additional arguments
    //or changes member role to additional argument
    async changeMemberRole(message, args) {
    if(args.length == 2){
        try {
    let res = await talent.findOneAndUpdate({guildID: message.guild.id, name: {$regex: args[0], $options: 'i'}},
        {
            '$set' : {
                    "memberRoleID": args[1]
            }
        }, {new: true}).lean().exec()
        if(res){
        message.channel.send("Member role for " + res.name + " changed to " + (await message.guild.roles.cache.get(res.memberRoleID)).name)
        } else message.channel.send(args[0]+ " not found in database.")
    } catch (e){
        console.log(e)
    }
            

    } else if(args.length == 1){
        try {
            let res = await talent.findOneAndUpdate({guildID: message.guild.id, name: {$regex: args[0], $options: 'i'}},
                {
                    '$unset' : {
                            "memberRoleID": ""
                    }
                }, {new: true}).lean().exec()
                if(res) message.channel.send("Member role for " + res.name + " cleared.")
                else message.channel.send(args[0]+ " not found in database.")
            } catch (e){
                console.log(e)
            }
    }
    else { message.channel.send("Invalid Arguments")}
    },
    //removes a talent membership from given user ID
    //called with <talent name> <user ID>
    async membershipRemove(message) {
    var args = message.content.slice(prefix.length).split(/ +/)

        if(args.length==3){
        
        let m = await message.guild.members.fetch(args[2])
        .then(async(member) => {
            let username = member.user.username
            console.log(username)
        try{
        let foundTalent = await talent.findOne({guildID: message.guild.id, name:{ $regex: args[1], $options: 'i' } }).lean().exec()
        if(foundTalent){
            try{
                let newTalent = await talent.findByIdAndUpdate(foundTalent._id,{
                    '$pull': {
                        'memberships': {'userID': args[2]}
                    }}, {new: true}).lean().exec()
            
            if(foundTalent.memberships.length>newTalent.memberships.length){
            message.channel.send(username + " removed from " + foundTalent.name)
            } else message.channel.send(username + " not found in " + foundTalent.name + "'s data.")
            try{
            let foundUser = await user.findOne({guildID: message.guild.id, userID: args[2]}).lean().exec()
            if(foundUser){
                let newUser = await user.findByIdAndUpdate(foundUser._id,{
                    '$pull': {
                        'memberships': {'talentName': foundTalent.name}
                    }}, {new: true}).exec()
                    if(foundUser.memberships.length>newUser.memberships.length){
                        message.channel.send(foundTalent.name + " removed from " + username + "'s membership data.")
                    } else message.channel.send("Could not find that membership")
                } else message.channel.send("User not found in database.")
                } catch (e) {console.log(e)}
            } catch (e) {console.log(e)}    
        } else message.channel.send("Talent not found in database.")
        } catch (e) {console.log(e)}
    }).catch((error) => {
        message.channel.send("Could not find that userID in server.")
    });

    } else message.channel.send("Missing arguments.")
},
    //will manually assign a member role DEBUGGING ONLY!!!
    async manualMembershipAssign(message, args){

    }
}