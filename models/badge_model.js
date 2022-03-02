const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: true
    },
    award_count: {
        type: Number,
        required: true
    }
})

const Badge = mongoose.model('Badge', badgeSchema)

module.exports = Badge
