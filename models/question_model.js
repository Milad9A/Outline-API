const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tag',
            },
        ],
        title: {
            type: 'String',
            required: true,
            unique: true,
        },
        body: {
            type: 'String',
            required: true,
        },
        is_answered: {
            type: Boolean,
            default: false,
        },
        view_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('View Count must be a positive number')
            },
        },
        answer_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Answer Count must be a positive number')
            },
        },
        score: {
            type: Number,
            default: 0,
        },
        last_activity_date: {
            type: Date,
            default: Date.now,
        },
        creation_date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

const Question = mongoose.model('Question', questionSchema)

module.exports = Question
