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
    try{
    let tal = await talent.findOne({guildID: guildID, name:{ $regex: '.*'+ talentName + '.*', $options: 'i' }}).lean().exec()
    if(!tal.memberRoleID) return false;
    let roleID = tal.memberRoleID
    let guild = await client.guilds.cache.get(guildID)
    member = await guild.members.fetch(userID)
        rolesInit = member.roles.cache.size
        if(!member.roles.cache.has(roleID)){
            res = await member.roles.add(roleID)
            if(res.roles.cache.size>rolesInit) {
                console.log("Role set")
                return true
        } else {
            console.log("Role not given")
            return false
        }
        } else {
            console.log(member.user.username + " already had Role: " + member.roles.cache.get(roleID)) 
        }
    }
    catch (e) {
        console.log(e)
        if (e) return false
    }
    
}

const iterateMemberships = async(user, talentName)=>{
    try{
    for await(const membership of user.memberships){
        if(membership.talentName==talentName){
            return membership._id
        }
    }
    return null
} catch (e) {console.log(e)}
}


module.exports = {
    async subChannel(message, args){
        try{
        let targetChannel = await message.guild.channels.cache.get(args[0])
            if(args.length==1){
            args[0].replace(/\D/g,'')
            res = member_channel.findOne({guildID: message.guildId}).exec()
                if(res==null){
                    await member_channel.create({
                        guildID: message.guildId,
                        channelID: args[0]
                    })
                    await message.channel.send(`No sub found. Sub created in ${targetChannel.toString()}.`)
                } else {
                    let prev = await message.guild.channels.cache.get(res.channelID)
                    await member_channel.findOneAndUpdate({_id: res._id},
                        {
                            '$set' : {
                                "channelID" : args[0]
                            }
                        },
                        {
                            new: true
                        }).exec()
                    await message.channel.send(`Previous sub found at ${prev.toString()}. Changed member channel sub to ${targetChannel.toString()}.`)
                }
        } else { message.channel.send("Too many arguments or no argument found for channel sub.") }
    } catch (e) {console.log(e)}
    },

    //adds a membership request to queue
    //called when k!member <talent> <date> is called by user
    async callSub(message, args) {
        try{
        if(message.attachments.size>0){
        if(args.length==2){
        let d = new Date(args[1])
        let now = new Date()
        if(d!=null){
        if(d.setDate(d.getDate()-32)<now){
        let tal = await talent.findOne({guildID: message.guildId, name:{ $regex: '.*'+ args[0]+ '.*', $options: 'i' } }).lean().exec()
            if(tal!=null){
                if(tal.memberRoleID){
                let memChannel = await member_channel.findOne({guildID: message.guildId})
                    if(memChannel!=null){
                        if(memChannel.channelID==message.channel.id){
                            //let user = await user.findOne({guildID: message.guildId, userID: message.author.id}).exec()
                                await member_channel.findByIdAndUpdate(memChannel._id,
                                    {
                                        '$push' : {
                                            "verificationIDs" : message.id
                                        }
                                    }, 
                                    {   
                                        new: true,
                                        upsert: true
                                    }).exec()
                                    
                                        await message.channel.send(message.id + " added to verification queue.")
                                    
                                await message.channel.send(`Request to member to ${args[0]} recieved.`)
                                message.react('✅')
                                message.react('❌')
                    } else message.channel.send("Request recieved from outside of verification channel " + message.guild.channels.cache.get(memChannel.channelID).toString())
                    
                    } else {
                        await message.channel.send("No membership verification channel set!")
                    }
            } else {
                message.channel.send("Talent does not have member role set.")
            }
            } else {
                message.channel.send("Talent not found subbed in your server.")
            }
        } else message.channel.send("Date is more than one month away")
        } else message.channel.send("Invalid date")
            

        } else message.channel.send("No args or too many args given")
    } else message.channel.send("No attachment found")
        }
        catch (e) {
            console.log(e)
        }
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
    try{
        var args = message.content.slice(prefix.length).split(/ +/)
        var guildID = message.guild.id
        console.log(guildID +  " "  + args[1])
        var talentName = await findTalentName(args[1], guildID)
        var exDate = new Date(args[2])
        var cl = client
        var inputMembership = new membership({
            talentName: talentName,
            expiration: exDate,
            staffID: staff,
            userID: message.author.id,
            notifyFlag: false
        })
        let member = await user.findOne({userID: message.author.id}).exec()
        let membershipID = await iterateMemberships(member, talentName)
        if(membershipID==null){
            if(await insertTalentMembership(guildID, talentName, inputMembership)){
                if (member==null){
                    user({
                        memberships: [new membership({
                            talentName: talentName,
                            expiration: exDate,
                            staffID: staff,
                            userID: message.author.id,
                            notifyFlag: false
                        })],
                        userID: message.author.id,
                        guildID: guildID
                    }).save()
                    await message.channel.send(`User created with their first membership to ${talentName}! Thanks ${(await message.guild.members.cache.get(authorID)).user.username}!`)
                    if(await memberRoleAssign(authorID, talentName, guildID, cl)){
                        message.channel.send("Role assigned.")
                    } else message.channel.send("User already had role assigned.")
                    
                } else {
                    await user.findOneAndUpdate({guildID: message.guildId, userID: message.author.id },
                    {
                        '$push': {
                            "memberships" : inputMembership
                        }
                    },
                    {
                        new: true,
                        upsert: true
                    })
                    await message.channel.send(`Added a membership to ${talentName} for ${(await message.guild.members.cache.get(authorID)).user.username}!`)
                    if(await memberRoleAssign(authorID, talentName, guildID, cl)){
                        message.channel.send("Role assigned.")
                    } else message.channel.send("User already had role assigned.")
                }
            } else message.channel.send("ERR: Could not add membership to " +talentName)
        } else {
            await user.findOneAndUpdate({_id: member._id, "membership_id" : membershipID}, 
            {
                "$set": {
                    "memberships.$[].expiration": exDate,
                    "memberships.$[].notifyFlag": false
                }
            }
            ).exec()
            message.channel.send(message.author.username + " is already verified for " + talentName+". Changed expiration to " + exDate.toDateString())}
    } catch (e) {console.log(e)}
    
    },
    //gets all of memberships for the user that called the command
    async getMemberships(message, args) {
        try{
        var me = await user.findOne({guildID: message.guild.id, userID: message.author.id}).lean().exec()
        if(me!=null){
            me.memberships.forEach(async function(membership){
                await message.channel.send(membership.talentName + " " + membership.expiration.toDateString() + " (Verified by: "+ (await message.guild.members.cache.get(membership.staffID)).user.username+ ")")
            })
        } else {
            message.channel.send("No memberships found.")
        }
    } catch (e){
        console.log(e)

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
    async manualMembershipRemove(message, args) {
        if(args.length==2){
        try{       
        let m = await message.guild.members.fetch(args[1])
        let username = m.user.username
        let foundTalent = await talent.findOne({guildID: message.guild.id, name:{ $regex: '.*'+ args[0]+ '.*', $options: 'i' } }).lean().exec()
        let foundUser = await user.findOne({guildID: message.guild.id, userID: args[1]}).lean().exec()
        if(foundTalent){
            if(foundUser){

                let newTalent = await talent.findByIdAndUpdate(foundTalent._id,{
                    '$pull': {
                        'memberships': {'userID': args[1]}
                    }}, {new: true}).lean().exec()
            
            if(foundTalent.memberships.length>newTalent.memberships.length){
            message.channel.send(username + " removed from " + foundTalent.name)
            } else message.channel.send(username + " not found in " + foundTalent.name + "'s data.")
                let newUser = await user.findByIdAndUpdate(foundUser._id,{
                    '$pull': {
                        'memberships': {'talentName': foundTalent.name}
                    }}, {new: true}).exec()
                    if(foundUser.memberships.length>newUser.memberships.length){
                        message.channel.send(foundTalent.name + " removed from " + username + "'s membership data.")
                        let gMember = await message.guild.members.fetch(foundUser.userID)
                        await gMember.roles.remove(foundTalent.memberRoleID)
                        message.channel.send("Role removed from user.")
                    } else message.channel.send("Could not find that membership")
                } else message.channel.send("User not found in database.")
        } else message.channel.send("Talent not found in database.")
        } catch (e) {console.log(e)}

    } else message.channel.send("Missing arguments.")
},
    //will manually assign a member role DEBUGGING ONLY!!!
    async manualMembershipAssign(message, args){

    },
    //will automatically remove a membership when reaction event is called
    async automatedMembershipRemove(member, membership, client){
        try{
        let guildID = member.guildID
        let userID = membership.userID
        let guild = await client.guilds.fetch(guildID)
        let gMember = await guild.members.fetch(userID)
        let tal = await talent.findOne({guildID: guildID, name: membership.talentName}).lean().exec()
        console.log(tal.memberRoleID)
        let role = await guild.roles.fetch(tal.memberRoleID)
        await gMember.roles.remove(role)
        await user.findOneAndUpdate({guildID: guildID, userID: userID},
        {
            "$pull" : {
                "memberships" : {"userID": userID}
            }
        }).exec()
        await talent.findOneAndUpdate({guildID: guildID, name: membership.talentName},
        {
            "$pull" :{
                "memberships" : {"userID" : userID}
                }
        }).exec()
    } catch (e) {console.log(e)}  
    },
    async notifyUser(member, membership, client){
        try{
        let userID = membership.userID
        let DM = await client.users.cache.get(userID).createDM()
        let guild = await client.guilds.fetch(member.guildID)
        
        DM.send(`Hi! You have one more day to renew your membership to ${membership.talentName}! Please verify in ${guild.name}. Thank you!`)
        await user.findOneAndUpdate({_id: member._id, "memberships._id" : membership._id}, 
            {
                "$set": {
                    "memberships.$[].notifyFlag": true
                }
            }, {upsert: true}
            ).exec()
        } catch (e) {
            console.log(e)
        }
    },
    async talentMembers(message, args){
    try{
        if(args.length==1){
            let tal = await talent.findOne({guildID: message.guild.id, name: { $regex: '.*'+ args[0]+ '.*', $options: 'i' }}).exec()
                for(const membership of tal.memberships){
                    message.channel.send(message.guild.members.cache.get(membership.userID).user.username)
                }
        } else message.channel.send("Incorrect # of args.")
    } catch (e)
    {console.log(e)}
    }
}