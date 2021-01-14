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
            required: true,
            ref: 'User',
        },
        accepted_answer_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Comment',
        },
        post_type_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
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
        },
        view_count: {
            type: Number,
            default: 0,
        },
        owner_display_name: {
            type: String,
            required: true,
            trim: true,
        },
        last_editor_display_name: {
            type: String,
            trim: true,
        },
        answer_count: {
            type: Number,
            default: 0,
        },
        comment_count: {
            type: Number,
            default: 0,
        },
        favorite_count: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

const task = mongoose.model('Task', taskSchema)

module.exports = Task
