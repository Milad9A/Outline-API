const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    count: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error('Count must be a positive number')
        },
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
    ],
})

const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
