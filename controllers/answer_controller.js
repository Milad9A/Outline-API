const Answer = require('../models/answer_model')
const Question = require('../models/question_model')

const AnswerController = {
    createAnswer: async (req, res) => {
        const answer = new Answer({
            ...req.body,
            owner_user_id: req.user._id,
        })

        try {
            const _id = req.body.question_id

            const question = await Question.findById(_id)

            if (!question) return res.status(404).send()

            await req.user.answers.push(answer)
            await question.answers.push(answer)

            await req.user.save()
            await question.save()
            await answer.save()

            await answer.populate('owner_user_id').execPopulate()

            res.status(201).send(answer)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getAllAnswers: async (req, res) => {
        try {
            const answers = await Answer.find({})

            res.send(answers)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getMyAnswers: async (req, res) => {
        try {
            await req.user.populate('answers').execPopulate()

            res.send(req.user.answers)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getAnswer: async (req, res) => {
        const _id = req.params.id

        try {
            const answer = await Answer.findOne({ _id })

            if (!answer) return res.status(404).send()

            res.send(answer)
        } catch (error) {
            res.status(500).send()
        }
    },

    updateAnswer: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const answer = await Answer.findOne({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!answer) return res.status(404).send()

            updates.forEach((update) => (answer[update] = req.body[update]))

            await answer.save()

            res.send(answer)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteAnswer: async (req, res) => {
        try {
            const answer = await Answer.findOneAndDelete({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!answer) return res.status(404).send()

            const index = req.user.answers.indexOf(answer)
            if (index > -1) req.user.answers.splice(index, 1)
            await req.user.save()

            res.send(answer)
        } catch (error) {
            res.status(500).send(error)
        }
    },

    voteAnswer: async (req, res) => {
        const _id = req.params.id
        const userId = req.user._id
        const voteValue = parseInt(req.query.value)

        if (voteValue != -1 && voteValue != 0 && voteValue != 1)
            return res.status(400).send({
                error: 'Incorrect value!',
            })

        try {
            const answer = await Answer.findOne({ _id })
            if (!answer) return res.status(404).send()

            const votes = answer.votes
            if (answer.owner_user_id.equals(userId))
                return res
                    .status(400)
                    .send({ error: "You can't vote for your own answer!" })

            let exists = false
            for (let index = 0; index < votes.length; index++) {
                const vote = votes[index]

                if (vote.user_id.equals(userId)) {
                    vote.value = voteValue
                    exists = true
                    break
                }
            }

            if (!exists) {
                answer.votes.push({
                    user_id: userId,
                    value: voteValue,
                })
            }

            await answer.save()
            await question.populate('owner_user_id').execPopulate()

            res.send({ answer, my_vote: voteValue })
        } catch (error) {
            console.log(error)
            res.status(400).send()
        }
    },
}

module.exports = AnswerController
