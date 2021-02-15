const mongoose = require('mongoose')

const privilegeSchema = new mongoose.Schema({
    reputation: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    short_description: {
        type: String,
        required: true,
    },
})

const Privilege = mongoose.model('Privilege', privilegeSchema)

module.exports = Privilege
