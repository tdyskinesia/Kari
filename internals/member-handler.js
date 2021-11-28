const Discord = require('discord.js');

const {talent, stream, user, membership, member_channel, guild} = require('../data/models');

const models = require('../data/models');

const mongoose = require('mongoose');
require('mongoose-long/index.js')(mongoose);
const {Types: {Long, Number, ObjectId}} = mongoose;

/**
 * Finds talent with given guild and name.
 * @param  {String} talentName
 * @param  {String} guildID
 */
const findTalentName = async(talentName, guildID) => {
    try{
    var q = await talent.findOne({guildID: guildID, name:{ $regex: '.*'+ talentName + '.*', $options: 'i' } }).lean().exec()
    if(q!=null){
        return q.name
        } else return null
    }
    catch (e){
        console.log(e)
    }
}
/**
 * @param  {String} guildID
 * @param  {String} talentName
 * @param  {membership} inputMembership
 * @deprecated
 */
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

/**
 * Assigns member role to given userID in given guildID.
 * @param  {String} userID
 * @param  {String} talentName
 * @param  {String} guildID
 * @param  {Discord.Client} client
 * @returns {Boolean} if role was assigned properly
 */
const memberRoleAssign = async(userID, talentName, guildID, client) => {
    try{
        let tal = await talent.findOne({guildID: guildID, name:{ $regex: '.*'+ talentName + '.*', $options: 'i' }}).lean().exec()
        if(tal.memberRoleID==null) return false;
        let roleID = tal.memberRoleID
        let guild = client.guilds.cache.get(guildID)
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
/**
 * Iterates through memberships of given queried user.
 * @param  {Array<mongoose.Types.ObjectId>} ids - Array of ObjectIds
 * @param  {String} talentName
 * @returns {mongoose.LeanDocument<>} Leandocument of membership
 * @todo deprecate
 */
const iterateMemberships = async(ids, talentName)=>{
    try{
        for await (const i of ids){
            let m = await membership.findById(i).lean().exec()
            if(m.talentName==talentName){
                return m
            }
        }
        return null

} catch (e) {console.log(e)}
}


module.exports = {
    
    /**
     * Subs verification channel of guild to given id.
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async subChannel(message, args){
        try{
        let targetChannel = message.guild.channels.cache.get(args[0])
            if(args.length==1){
            args[0].replace(/\D/g,'')
            let res = await member_channel.findOne({guildID: message.guildId}).exec()
                if(res==null){
                    await member_channel.create({
                        guildID: message.guildId,
                        channelID: args[0],
                        verificationIDs: []
                    })
                    await models.guild.findOneAndUpdate({guildID: message.guild.id}, {'$set': {"member_channel_id": ObjectId(res._id)}}).exec()
                    await message.channel.send(`No sub found. Sub created in ${targetChannel.toString()}.`); return
                } else {
                    let prev = await member_channel.findOneAndUpdate({_id: res._id},
                        {
                            '$set' : {
                                "channelID" : args[0]
                            }
                        }).exec()
                    await models.guild.findOneAndUpdate({guildID: message.guild.id}, {'$set': {"member_channel_id": ObjectId(prev._id)}}).exec()
                    await message.channel.send(`Previous sub found at ${message.guild.channels.cache.get(prev.channelID).toString()}. Changed member channel sub to ${targetChannel.toString()}.`); return
                }
        } else { message.channel.send("Too many arguments or no argument found for channel sub."); return }
    } catch (e) {console.log(e)}
    },
    /**
     * Adds a membership request to queue. Called when k!member <talent> <date> is called by user.
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async callSub(message, args) {
        try{
        if(message.attachments.size>0){
        if(args.length==2){
        let d = new Date(args[1])
        let now = new Date()
        if(d!=null){
        if(d.setDate(d.getDate()-32)<now&&d.setDate(d.getDate()+32)>now){
        let tal = await talent.findOne({guildID: message.guildId, name:{ $regex: '.*'+ args[0]+ '.*', $options: 'i' } }).lean().exec()
            if(tal!=null){
                if(tal.memberRoleID){
                let memChannel = await member_channel.findOne({guildID: message.guildId})
                    if(memChannel!=null){
                        if(memChannel.channelID==message.channel.id){
                                await member_channel.findByIdAndUpdate(memChannel._id,
                                    {
                                        '$push' : {
                                            "verificationIDs" : message.id
                                        }
                                    }).exec()
                                await message.channel.send(message.id + " added to verification queue."+ message.author.username +", your request to verify membership to " + tal.name + " has been accepted.")
                                await message.react('✅')
                                await message.react('❌')
                                return
                    } else message.channel.send("Request recieved from outside of verification channel " + message.guild.channels.cache.get(memChannel.channelID).toString()); return
                    
                    } else {
                        await message.channel.send("No membership verification channel set!"); return
                    }
            } else {
                message.channel.send("Talent does not have member role set."); return
            }
            } else {
                message.channel.send("Talent not found subbed in your server."); return
            }
        } else message.channel.send("Date is more than one month away or it has already passed!"); return
        } else message.channel.send("Invalid date"); return
            

        } else message.channel.send("No args or too many args given"); return
    } else message.channel.send("No attachment found"); return
        }
        catch (e) {
            console.log(e)
        }
    },

    /**
     * Sets a member role to a talent that previously didn't have one.
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async subMemberRole(message, args){
        try{
            if(args.length==2){
                let res = await talent.findOneAndUpdate({guildID: message.guildId, name:{ $regex: args[0], $options: 'i' }},
                {
                    '$set': {
                        "memberRoleID" : args[1]
                    }
                })
                
                await message.channel.send(res.name + " member role set to " + message.guild.roles.cache.get(res.memberRoleID).name); return
                

            } else message.channel.send("Too many or no arguments"); return
        } 
        catch (e){
            console.log(e)
        }
    },

    /**
     * Creates a membership for a member. Called from reaction event.
     * @param  {Discord.Message} message
     * @param  {String} authorID
     * @param  {String} staff
     * @param  {String} prefix
     * @param  {Discord.Client} client
     */
    
    async inputMember(message, authorID, staff, prefix, client) {
        try{
            let args = message.content.slice(prefix.length).split(/ +/)
            let guildID = message.guild.id
            console.log(guildID +  " "  + args[1])
            let talentName = await findTalentName(args[1], guildID)
            let exDate = new Date(args[2])
            let member = await user.findOne({userID: authorID}).lean().exec()
            let foundMembership = await iterateMemberships(member.membership_IDs, talentName)
            if(foundMembership==null){
                let memberChannel = await member_channel.findOne({guildID: guildID}).lean().exec()
                let newMembership = await membership.create({
                    talentName: talentName,
                    expiration: exDate,
                    staffID: staff,
                    userID: authorID,
                    notifyFlag: false,
                    member_channel_ID: memberChannel._id
                })
                let g = await models.guild.findOneAndUpdate({guildID: message.guild.id},{'$push' : {"membership_IDs": ObjectId(newMembership._id)}}, {new: true}).exec()
                    if (member==null){
                        let newUser = await user.create({
                            memberships_IDs: [ObjectId(newMembership._id)],
                            userID: message.author.id,
                            guildIDs: [guildID]
                        })
                        await g.user_IDs.push(ObjectId(newUser._id))
                        await g.save()
                        await models.guild.findOneAndUpdate({guildID: guildID}, {'$push' : {"membership_IDs" : ObjectId(newMembership._id), "user_IDs": newUser._id}, upsert: true}).exec()
                        await message.channel.send(`User created with their first membership to ${talentName}! Thanks ${message.author.username}! (Verified: ${message.guild.members.cache.get(staff)})`)
                        if(memberRoleAssign(authorID, talentName, guildID, client)){
                            await message.channel.send("Role assigned."); return
                        } else await message.channel.send("User already had role assigned."); return
                        
                    } else {
                        let newUser = await user.findOneAndUpdate({userID: authorID },{'$push': {"membership_IDs" : ObjectId(newMembership._id)}},{new: true, upsert: true}).lean().exec()
                        await models.guild.findOneAndUpdate({guildID: guildID}, {'$push' : {"membership_IDs" : ObjectId(newMembership._id), "user_IDs": newUser._id}, upsert: true}).exec()
                        await message.channel.send(`Added a membership to ${talentName} for ${(message.guild.members.cache.get(authorID)).user.username}! (Verified: ${message.guild.members.cache.get(staff)})`)
                        if(memberRoleAssign(authorID, talentName, guildID, client)){
                            await message.channel.send("Role assigned."); return
                        } else await message.channel.send("User already had role assigned."); return
                    }
            } else {
                await membership.findByIdAndUpdate(foundMembership._id, {'$set': {"expiration" : exDate}}).exec()
                await message.channel.send(message.author.username + " is already verified for " + talentName +". Changed expiration to " + exDate.toDateString()); return;
            }
        } catch (e) {console.log(e)}
    },
    /**
     * Gets all of memberships for the user that called the command.
     * @param  {Discord.Message} message
     */
    async getMemberships(message) {
    try{
        var me = await user.findOne({userID: message.author.id}).lean().exec()
        if(me!=null&&me.membership_IDs.length>0){
            me.membership_IDs.forEach(async function(membership_ID){
                let curMembership = await membership.findById(membership_ID).lean().exec()
                await message.channel.send(curMembership.talentName + " " + curMembership.expiration.toDateString() + " (Verified by: "+ (message.guild.members.cache.get(curMembership.staffID)).user.username+ ")")
            })
        } else {
            message.channel.send("No memberships found.")
        }
    } catch (e){
        console.log(e)

    }
    },

    /**
     * Clears member role for given talent if no additional arguments. Changes member role to additional argument.
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async changeMemberRole(message, args) {
    try {
        if(args.length == 2){
        if(message.guild.roles.cache.get(args[2])!=null){
        let res = await talent.findOneAndUpdate({guildID: message.guild.id, name: {$regex:'.*' + args[0] + '.*', $options: 'i'}},
            {
                '$set' : {
                        "memberRoleID": args[1]
                }
            }, {new: true}).lean().exec()
            if(res!=null){
            await message.channel.send("Member role for " + res.name + " changed to " + message.guild.roles.cache.get(res.memberRoleID).name); return
            } else await message.channel.send(args[0]+ " not found in database."); return
        } else await message.channel.send("Role not found in server."); return
                

        } else if(args.length == 1){
                let res = await talent.findOneAndUpdate({guildID: message.guild.id, name: {$regex:'.*' + args[0] + '.*', $options: 'i'}},
                    {
                        '$unset' : {
                                "memberRoleID": ""
                        }
                    }, {new: true}).lean().exec()
                    if(res) {await message.channel.send("Member role for " + res.name + " cleared."); return}
                    else {await message.channel.send(args[0]+ " not found in database."); return}
        } else { message.channel.send("Invalid Arguments"); return}
    } catch (e) {console.log(e)}
    },

    /**
     * Removes a talent membership from given user ID. Called with [talent name] [user ID].
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async manualMembershipRemove(message, args) {
    try{    
        if(args.length==2){   
        let foundTalent = await talent.findOne({guildID: message.guild.id, name:{ $regex: '.*'+ args[0]+ '.*', $options: 'i' } }).lean().exec()
        let foundUser = await user.findOne({userID: args[1]}).lean().exec()
            if(foundTalent!=null){
                if(foundUser!=null){
                    let foundMembership = await membership.findOne({guildID: message.guild.id, userID: foundUser.userID, talentName: foundTalent.name})
                        if(foundMembership!=null){
                        let newTalent = await talent.findByIdAndUpdate(foundTalent._id,{
                            '$pull': {
                                'membership_IDs': ObjectId(foundMembership._id)
                            }}, {new: true}).lean().exec()
                        let newUser = await user.findByIdAndUpdate(foundUser._id,{
                            '$pull': {
                                'membership_IDs': ObjectId(foundMembership._id)
                            }}, {new: true}).exec()
                        let newGuild = await models.guild.findOneAndUpdate({guildID: message.guild.id}, {'$pull': {"membership_IDs": ObjectId(foundMembership._id)}}, {new:true}).exec()
                            if(newTalent!=null&&newUser!=null&&newGuild!=null){
                                let gMember = await message.guild.members.fetch(foundUser.userID)
                                let newMember = await gMember.roles.remove(foundTalent.memberRoleID)
                                if(newMember.roles.cache.size<gMember.roles.cache.size){
                                    message.channel.send("Role removed from " + gMember.user.username)
                                } else message.channel.send("Could not remove role or user did not have that role.")
                            } else message.channel.send("ERR: COULD NOT FIND REFERENCE _ID. DATABASE ERROR.")
                        } else message.channel.send("Could not find that membership.")
                    } else message.channel.send("User not found in database.")
            } else message.channel.send("Talent not found in database.")
        } else message.channel.send("Missing arguments.")
    } catch (e) {console.log(e)}
},
    //will manually assign a membership DEBUGGING ONLY!!!
    async manualMembershipAssign(message, args){

    },
    
    /**
     * Automatically removes a membership when reaction event is called
     * @param  {mongoose.Query} member
     * @param  {mongoose.Query} membership
     * @param  {Discord.Client} client
     */
    async automatedMembershipRemove(member, mship, client){
        try{
            let guildID = mship.guildID
            let userID = mship.userID
            let guild = await client.guilds.fetch(guildID)
            let gMember = await guild.members.fetch(userID)
            let tal = await talent.findOne({guildID: guildID, name: mship.talentName}).lean().exec()
            let role = await guild.roles.fetch(tal.memberRoleID)
            await gMember.roles.remove(role)
            await user.findOneAndUpdate({userID: userID},
            {
                "$pull" : {
                    "membership_IDs" : ObjectId(mship._id)
                }
            }).exec()
            await talent.findOneAndUpdate({guildID: guildID, name: mship.talentName},
            {
                "$pull" :{
                    "membership_IDs" : ObjectId(mship._id)
                    }
            }).exec()
            await guild.findOneAndUpdate({guildID: guildID}, {'$pull':{"membership_IDs": ObjectId(mship._id)}}).exec()
            return;
        } catch (e) {console.log(e)}  
    },

    /**
     * Function called by the automated member-roles func. Notifies member one day before role expires.
     * @param  {mongoose.Query} member
     * @param  {mongoose.Query} mship
     * @param  {Discord.Client} client
     */
    async notifyUser(member, mship, client){
        try{
            let userID = mship.userID
            let DM = await client.users.cache.get(userID).createDM()
            let guild = await client.guilds.fetch(member.guildID)
            
            await DM.send(`Hi! You have one more day to renew your membership to ${mship.talentName}! Please verify in ${guild.name}'s verification channel ${guild.channels.cache.get((await member_channel.findOne({guildID})).channelID.toString())}. Thank you!`)
            mship.notifyFlag = false
            await mship.save();
            return
        } catch (e) {
            console.log(e)
        }
    },

    /**
     * Finds all members of given talent name and returns in a message.
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async talentMembers(message, args){
    try{
        if(args.length==1){
            let mships = await membership.find({guildID: message.guild.id, talentName: { $regex: '.*'+ args[0]+ '.*', $options: 'i' }}).lean().exec()
            let s = ""
            for await (const m of mships){
                s += message.guild.members.cache.get(m.userID).user.username + ",\n"
            }
            await message.channel.send(mships[0].talentName+" Memberships: "+s); return
        } else await message.channel.send("Incorrect # of args."); return
    } catch (e)
    {console.log(e)}
    },
    async migrateData(message){
    try{
        let outArr = []
        let mch = await member_channel.findOne({guildID: message.guild.id})
        let g = await models.guild.create({
            guildID: message.guild.id,
            membership_IDs: [],
            user_IDs: [],
            talent_IDs: [],
            member_channel_id: mch._id
        })
        outArr.push(mch._id)
        for await(const member of user.find()){
            await models.guild.findByIdAndUpdate(g._id,{'$push':{"user_IDs": member._id}}).exec()
            outArr.push(member._id)
            if(member.memberships!=null){
                for(var i in member.memberships){
                    let m = await membership.create({
                        talentName: member.memberships[i].talentName,
                        expiration: member.memberships[i].expiration,
                        staffID: member.memberships[i].staffID,
                        userID: member.memberships[i].userID,
                        notifyFlag: member.memberships[i].notifyFlag,
                        member_channel_ID: mch._id
                    })
                    await models.guild.findByIdAndUpdate(g._id,{'$push':{"membership_IDs": m._id}}).exec()
                    outArr.push(m._id)
                    m.member_channel_ID = mch._id
                    member.membership_IDs.push(ObjectId(m._id))
                    let tal = await talent.findOneAndUpdate({guildID: message.guild.id, name: m.talentName}, {'$push': {"membership_IDs": ObjectId(m._id)}}, {new: true, upsert: true}).exec()
                    await m.save()
                }
            }
        }
        for await (const t of talent.find({guildID: message.guild.id})){
            await models.guild.findByIdAndUpdate(g._id,{'$push':{"talent_IDs": t._id}}).exec()
            for await(const mship of membership.find({talentName: t.name})){
                t.membership_IDs.push(ObjectId(mship._id))
                outArr.push(mship._id)
            }
        }
        await message.channel.send(outArr.join(', '))
        await g.save()
        await message.channel.send("Data successfully migrated.")
    } catch(e) {
        console.log(e)
    }
    },
    /**
     * Subs a talent to membership handling. 
     * @param  {Discord.Message} message
     * @param  {Array<String>} args
     */
    async subMembershipTalent(message, args){
        try{
            if(args > 1){ 
                let arr = []
                for(var i = 2; i < args.length; i++){
                    arr.push(args[i])
                }
                let tal = await talent.create({
                    name: args[0],
                    aliases: arr,
                    memberRoleID: args[1],
                    guildName: message.guild.name,
                    guildID: message.guild.id
                })
                message.channel.send("New membership talent " + tal.name +" subbed for " + tal.guildName + " with aliases " + 
                arr.join(", ")+ " and member role ID: " + tal.memberRoleID)
            } else message.channel.send("Insufficient args");
        } catch (e) {console.log(e)}
    },
    async migrate2(message, args){
        try{
            let g = await guild.create({
                guildID: message.guild.id,
                notificationsFlag: true,
                membership_IDs: [],
                user_IDs: [],
                member_channel_id: []
            })
            let m = await membership.find().exec()
            for(var e in m){
                await user.findOneAndUpdate({userID: m[e].userID}, {'$push': {"membership_IDs": m[e]._id}}, {upsert: true}).exec()
                await guild.findOneAndUpdate({guildID: message.guild.id}, {'$push': {"membership_IDs": m[e]._id}}).exec()
            }
            for(const t of talent.find()){
                await guild.findOneAndUpdate({guildID: message.guild.id}, {'$push': {"talent_IDs": t._id}}).exec()
            }
            for(const u of user.find()){
                await guild.findOneAndUpdate({guildID: message.guild.id}, {'$push': {"user_IDs": u._id}}).exec()
            }
            

        } catch(e) {console.log(e)}
    }
}