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

questionSchema.methods.getMyVote = async function (id) {
    const user = await User.findById(id)

    if (!user)
        throw new InvalidEmailOrPasswordError('Invalid Email or Password')

    const votes = this.votes
    for (let index = 0; index < votes.length; index++) {
        const vote = votes[index]
        if (vote.user_id.equals(id)) return vote.value
    }
    return 0
}

questionSchema.virtual('score').get(function () {
    if (!this.votes) return 0

    let sum = 0
    for (let index = 0; index < this.votes.length; index++) {
        const vote = this.votes[index]
        sum += vote.value
    }
    return sum
})

const Question = mongoose.model('Question', questionSchema)

module.exports = Question
