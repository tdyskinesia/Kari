const mongoose = require('mongoose')

const userSchema  = require('./userSchema.js')

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
    verificationChannel: {
        type: String,
        required: false
    },
    memberships: {
        type: [userSchema.membership],
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


module.exports = {
talent: mongoose.model('talent', talent),
stream: mongoose.model('stream', stream)
}