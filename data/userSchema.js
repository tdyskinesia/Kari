const mongoose = require('mongoose')

const membership = new mongoose.Schema({
    talentID:{
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
    },

})

const user = new mongoose.Schema({
    memberships:{
        type: [membership],
        required: true
    },
    id:{
        type: String,
        required: true
    },
    guildID: {
        type: String, 
        required: true
    }
})

module.exports = {
    user: mongoose.model('user', user),
    membership: mongoose.model('membership', membership)
}