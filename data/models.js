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

const stream = new mongoose.Schema({
    streamName: {
        type: String,
        // required: true
    },
    //scheduled
    startTime: {
        type: Date,
        // required: true
    },
    //detected
    dStart: {
        type: Date
    },
    dEnd: {
        type: Date
    },
    videoID: {
        type: String,
        // required: true
    },
    thumbnailUrl: {
        type: String,
        // required: true
    },
    description: {
        type: String
    },
    notify: {
        type: Boolean,
        default: false
    },
    talent_id: {type: ObjectId, ref: 'talent'}

})

const space = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    creator_id: {
        type: String,
        required: true
    },
    notify: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true
    },
    talent_id: {type: ObjectId, ref: 'talent'}
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
    membership_IDs: [{type: ObjectId, ref: 'membership'}],

    memberRoleID: {
        type: String,
        // required: false
    },
    profileURL: {
        type: String,
        // required: false
    },
    streams: [{type: ObjectId, ref: 'stream'}],

    twitterID: {
        type: String,
        required: false
    },

    order: {
        type: Number,
        required: false
    }

    //to remove
    // upcomingStreams: {
    //     type: [stream],
    //     // required: false
    // },
    // liveStream: {
    //     type: stream,
    //     // required: false
    // },
    // pastStreams: {
    //     type: [stream],
    //     // required: false
    // }
})


const user = new mongoose.Schema({
    membership_IDs:[{type: ObjectId, ref: 'membership'}],

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
    boosterRoleID:{
        type: String
    },
    boardChannelID:{
        type: String
    },
    boardMessage:{
        type: [String]
    },
    membership_IDs: [{type: ObjectId, ref: 'membership'}],
    user_IDs: [{type: ObjectId, ref: 'user'}],
    talent_IDs: [{type: ObjectId, ref: 'talent'}],
    member_channel_id:{
        type: ObjectId, 
        ref: 'member_channel',
        required: false
    }
})

module.exports = {
talent: mongoose.model('talent', talent),
stream: mongoose.model('stream', stream),
space: mongoose.model('space', space),
user: mongoose.model('user', user),
membership: mongoose.model('membership', membership),
member_channel: mongoose.model('member_channel', member_channel),
guild: mongoose.model('guild', guild)
}