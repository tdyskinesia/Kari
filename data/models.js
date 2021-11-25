const mongoose = require('mongoose');

const Discord = require('discord.js');

const stream = new mongoose.Schema({
    streamName: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    videoID: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    }
})

const talent = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    youtubeID: {
        type: String,
        required: true
    },
    liveChannelID: {
        type: String,
        required: true
    },
    roleID: {
        type: String,
        required: true
    },
    guildName: {
        type: String,
        required: true
    },
    guildID: {
        type: String,
        required: true
    },
    memberships: {
        type: [membership],
        required: false
    },
    profileURL: {
        type: String,
        required: false
    },
    upcomingStreams: {
        type: [stream],
        required: false
    },
    liveStream: {
        type: stream,
        required: false
    },
    pastStreams: {
        type: [stream],
        required: false
    }
})

const membership = new mongoose.Schema({
    talentName:{
        type: String,
        required: true
    },
    expiration:{
        type: Date,
        required: true
    },
    staffID: {
        type: String,
        required: true
    }
})

const user = new mongoose.Schema({
    memberships:{
        type: [membership],
        required: true
    },
    userID:{
        type: String,
        required: true
    },
    guildID: {
        type: String, 
        required: true
    }
})

const member_channel = new mongoose.Schema({
    guildID: {
        type: String,
        required: true
    },
    channelID: {
        type: String, 
        required: true
    },
    reactionCollectors: {
        type: [Discord.MessageCollector],
        required: false
    }
})

module.exports = {
talent: mongoose.model('talent', talent),
stream: mongoose.model('stream', stream),
user: mongoose.model('user', user),
membership: mongoose.model('membership', membership),
member_channel: mongoose.model('member_channel', member_channel)
}