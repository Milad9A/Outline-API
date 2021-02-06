const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        last_editor_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        accepted_answer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        post_type_id: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: 'PostType',
        },
        body: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        score: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Score must be a positive number')
            },
        },
        view_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('View Count must be a positive number')
            },
        },
        owner_display_name: {
            type: String,
            trim: true,
        },
        last_editor_display_name: {
            type: String,
            trim: true,
        },
        answer_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Answer Count must be a positive number')
            },
        },
        comment_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Comment must be a positive number')
            },
        },
        favorite_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Favorite Count must be a positive number')
            },
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tag',
            },
        ],
    },
    {
        timestamps: true,
    }
)

const Post = mongoose.model('Post', postSchema)

module.exports = Post
