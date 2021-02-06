const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    excerpt_post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    tag_name: {
        type: String,
        required: true,
        trim: true,
    },
    count: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error('Count must be a positive number')
        },
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
})

const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
