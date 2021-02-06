const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Post',
        },
        score: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Score must be a positive number')
            },
        },
        body: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
