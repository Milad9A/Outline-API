const mongoose = require('mongoose')
const User = require('./user_model')

const answerSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Question'
        },
        body: {
            type: 'String',
            required: true
        },
        is_accepted: {
            type: Boolean,
            default: false
        },
        votes: [
            {
                user_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'User'
                },
                value: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

answerSchema.methods.getMyVote = async function (id) {
    const user = await User.findById(id)

    if (!user) throw new InvalidEmailOrPasswordError('User not found')

    const votes = this.votes
    for (let index = 0; index < votes.length; index++) {
        const vote = votes[index]
        if (vote.user_id.equals(id)) return vote.value
    }
    return 0
}

answerSchema.virtual('score').get(function () {
    if (!this.votes) return 0

    let sum = 0
    for (let index = 0; index < this.votes.length; index++) {
        const vote = this.votes[index]
        sum += vote.value
    }
    return sum
})

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer
