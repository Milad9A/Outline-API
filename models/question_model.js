const mongoose = require('mongoose')
const User = require('../models/user_model')

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
            default: function () {
                if (!this.votes) return 0
                return this.votes.reduce((a, b) => a.value + b.value)
            },
        },
        votes: [
            {
                user_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'User',
                },
                value: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)

questionSchema.pre('save', function (next) {
    if (this.votes.length !== 0)
        this.score = this.votes.reduce((a, b) => a.value + b.value)
    next()
})

questionSchema.methods.getMyVote = async function (id) {
    const user = await User.findById(id)

    if (!user)
        throw new InvalidEmailOrPasswordError('Invalid Email or Password')

    const votes = this.votes
    for (let index = 0; index < votes.length; index++) {
        const vote = votes[index]
        if (vote.user_id.equals(id)) return vote.value
    }
    return -1
}

const Question = mongoose.model('Question', questionSchema)

module.exports = Question
