const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        article_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Article',
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
