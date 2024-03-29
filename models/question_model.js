const mongoose = require('mongoose')
const User = require('../models/user_model')
const TextSearch = require('mongoose-partial-full-search')

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
        answers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Answer',
            },
        ],
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

questionSchema.index({
    title: 'text',
    body: 'text',
})

questionSchema.statics = {
    searchPartial: function (q, callback) {
        return this.find(
            {
                $or: [
                    { title: new RegExp(q, 'gi') },
                    { body: new RegExp(q, 'gi') },
                ],
            },
            callback
        )
    },

    searchFull: function (q, callback) {
        return this.find(
            {
                $text: { $search: q, $caseSensitive: false },
            },
            callback
        )
    },

    search: function (q, callback) {
        this.searchFull(q, (err, data) => {
            if (err) return callback(err, data)
            if (!err && data.length) return callback(err, data)
            if (!err && data.length === 0)
                return this.searchPartial(q, callback)
        })
    },
}

questionSchema.methods.getMyVote = async function (id) {
    const user = await User.findById(id)

    if (!user) throw new InvalidEmailOrPasswordError('User not found')

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
