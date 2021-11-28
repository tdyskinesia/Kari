const mongoose = require('mongoose');
const {Schema: {Types: {ObjectId}}} = mongoose;

const Discord = require('discord.js');

const member_channel = new mongoose.Schema({
    guildID: {
        type: String,
        // required: true
    },
    channelID: {
        type: String, 
        // required: true
    },
    verificationIDs: {
        type: [String],
        // required: true
    }
})

const membership = new mongoose.Schema({
    talentName:{
        type: String,
        // required: true
    },
    expiration:{
        type: Date,
        // required: true
    },
    staffID: {
        type: String,
        // required: true
    },
    userID: {
        type: String,
        // required: true
    },
    notifyFlag:{
        type: Boolean,
        // required: false
    },
    member_channel_ID: {
        type: ObjectId, 
        ref: 'member_channel',
        // required: false
    }
})

const talent = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    aliases: {
        type: [String],
        // required: false
    },
    youtubeID: {
        type: String,
        // required: true
    },
    liveChannelID: {
        type: String,
        // required: true
    },
    roleID: {
        type: String,
        // required: true
    },
    guildName: {
        type: String,
        // required: true
    },
    guildID: {
        type: String,
        // required: true
    },
    //to remove
    memberships: {
        type: [membership],
        required: false
    },
    membership_IDs: {
        type: [{ObjectId, ref: 'membership'}],
        // required: false
    },
    memberRoleID: {
        type: String,
        // required: false
    },
    profileURL: {
        type: String,
        // required: false
    },
    upcomingStreams: {
        type: [stream],
        // required: false
    },
    liveStream: {
        type: stream,
        // required: false
    },
    pastStreams: {
        type: [stream],
        // required: false
    }
})

const stream = new mongoose.Schema({
    streamName: {
        type: String,
        // required: true
    },
    startTime: {
        type: String,
        // required: true
    },
    videoID: {
        type: String,
        // required: true
    },
    thumbnailUrl: {
        type: String,
        // required: true
    },
    talent_id: {
        type: [{ObjectId, ref: 'talent'}],
        required: false
    }
})

const user = new mongoose.Schema({
    membership_IDs:{
        type: [{ObjectId, ref: 'membership'}],
        // required: true
    },
    //to remove
    memberships:{
        type: [membership],
        required: false
    },
    userID:{
        type: String,
        // required: true
    },
    //to remove
    guildID: {
        type: String, 
        required: true
    },
    guildIDs: {
        type: [String], 
        // required: true
    },

})

const guild = new mongoose.Schema({
    guildID: {
        type: String,
        // required: true
    },
    notificationsFlag: {
        type: Boolean
    },
    membership_IDs: {
        type: [{ObjectId, ref: 'membership'}],
        required: false
    },
    user_IDs: {
        type: [{ObjectId, ref: 'user'}],
        required: false
    },
    talent_IDs: {
        type: [{ObjectId, ref: 'talent'}],
        required: false
    },
    member_channel_id:{
        type: ObjectId, 
        ref: 'member_channel',
        required: false
    }
})

module.exports = {
talent: mongoose.model('talent', talent),
stream: mongoose.model('stream', stream),
user: mongoose.model('user', user),
membership: mongoose.model('membership', membership),
member_channel: mongoose.model('member_channel', member_channel),
guild: mongoose.model('guild', guild)
}