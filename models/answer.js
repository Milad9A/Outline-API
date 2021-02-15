const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    owner_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Question',
    },
    is_accepted: {
        type: Boolean,
        default: false,
    },
    score: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error('Score must be a positive number')
        },
    },
    last_activity_date: {
        type: Date,
    },
    creation_date: {
        type: Date,
    },
})

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer
