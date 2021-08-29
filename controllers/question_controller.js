const Question = require('../models/question_model')
const User = require('../models/user_model')
const Tag = require('../models/tag_model')
const FCMHelper = require('../helpers/fcm_helper')

const QuestionController = {
    createQuestion: async (req, res) => {
        const question = new Question({
            ...req.body,
            owner_user_id: req.user._id,
        })

        let tags = []
        question.tags.forEach((tag) => {
            tags.push(tag)
        })

        tags.forEach(async (id) => {
            tag = await Tag.findOne({
                _id: id,
            })
            if (!tag)
                return res.status(404).send({
                    message:
                        'One or more of the tags that you provided are not available',
                })
            tag.questions.push(question)
            await tag.save()
        })

        try {
            await req.user.questions.push(question)
            await req.user.save()
            await question.save()
            await question.populate('tags').execPopulate()
            await question
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'owner_user_id',
                    },
                })
                .execPopulate()
            await question.populate('owner_user_id').execPopulate()

            res.on('finish', async () => {
                if (question.tags.length > 0) {
                    const users = await User.find({})
                    for (let index = 0; index < users.length; index++) {
                        if (
                            users[index].tags.some((tag) =>
                                question.tags
                                    .map((questionTag) => questionTag._id)
                                    .includes(tag)
                            )
                        ) {
                            var token = 'token'
                            if (users[index].fcm_token) {
                                token = users[index].fcm_token
                            }

                            const message = {
                                notification: {
                                    title: 'Outline',
                                    body: `${req.user.name} asked a new question about a tag you follow!`,
                                },
                                data: {
                                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                                    screen_name: 'question_details_screen',
                                    id: '123',
                                },
                                token: token,
                            }

                            if (token !== 'token')
                                FCMHelper.sendPushNotification(message)
                        }
                    }
                }
            })

            res.status(201).send(question)
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    getAllQuestions: async (req, res) => {
        try {
            const questions = await Question.find({}, null, {
                limit:
                    req.query.limit !== undefined
                        ? parseInt(req.query.limit)
                        : 10,
                skip: parseInt(req.query.skip),
            })

            let id
            if (req.user) id = req.user._id

            for (let index = 0; index < questions.length; index++) {
                await questions[index].populate('tags').execPopulate()
                await questions[index].populate('owner_user_id').execPopulate()
                questions[index] = {
                    question: questions[index],
                    my_vote: id ? await questions[index].getMyVote(id) : -1,
                }
            }

            res.send(questions)
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    getMyQuestions: async (req, res) => {
        try {
            await req.user.populate('questions').execPopulate()

            let questions = req.user.questions

            for (let index = 0; index < questions.length; index++) {
                await questions[index].populate('tags').execPopulate()
                await questions[index].populate('owner_user_id').execPopulate()
            }

            res.send(questions)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getQuestion: async (req, res) => {
        const _id = req.params.id

        try {
            const question = await Question.findOne({ _id })

            if (!question) return res.status(404).send()

            await question.populate('tags').execPopulate()
            await question
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'owner_user_id',
                    },
                })
                .execPopulate()
            await question.populate('owner_user_id').execPopulate()

            const myVote = await question.getMyVote(req.user._id)

            res.send({ question, my_vote: myVote })
        } catch (error) {
            console.log(error)
            res.status(400).send()
        }
    },

    voteQuestion: async (req, res) => {
        const _id = req.params.id
        const userId = req.user._id
        const voteValue = parseInt(req.query.value)

        if (voteValue != -1 && voteValue != 0 && voteValue != 1)
            return res.status(400).send({
                error: 'Incorrect value!',
            })

        try {
            const question = await Question.findOne({ _id })
            if (!question) return res.status(404).send()

            const votes = question.votes
            if (question.owner_user_id.equals(userId))
                return res
                    .status(400)
                    .send({ error: "You can't vote for your own question!" })

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
                question.votes.push({
                    user_id: userId,
                    value: voteValue,
                })
            }

            await question.save()
            await question.populate('tags').execPopulate()
            await question
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'owner_user_id',
                    },
                })
                .execPopulate()
            await question.populate('owner_user_id').execPopulate()

            let id
            if (req.user) id = req.user._id

            for (let index = 0; index < question.answers.length; index++) {
                question.answers[index] = {
                    answer: question.answers[index],
                    my_vote: await question.answers[index].getMyVote(id),
                }
            }

            res.send({ question, my_vote: voteValue })
        } catch (error) {
            console.log(error)
            res.status(400).send()
        }
    },

    updateQuestion: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const question = await Question.findOne({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!question) return res.status(404).send()

            updates.forEach((update) => (question[update] = req.body[update]))

            let tags = []

            question.tags.forEach((tag) => {
                tags.push(tag)
            })

            tags.forEach(async (id) => {
                tag = await Tag.findOne({
                    _id: id,
                })

                if (!tag)
                    return res.status(404).send({
                        message:
                            'One or more of the tags that you provided does not exist',
                    })
                tag.questions.push(question)
                await tag.save()
            })

            await question.save()
            await question.populate('tags').execPopulate()
            await question
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'owner_user_id',
                    },
                })
                .execPopulate()
            await question.populate('owner_user_id').execPopulate()

            res.send(question)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const question = await Question.findOneAndDelete({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!question) return res.status(404).send()

            const index = req.user.questions.indexOf(question)

            if (index > -1) req.user.questions.splice(index, 1)
            await req.user.save()

            res.send(question)
        } catch (error) {
            res.status(500).send()
        }
    },

    getQuestionTags: async (req, res) => {
        try {
            const question = await Question.findOne({
                _id: req.params.id,
            })

            if (!question) return res.status(404).send()

            await question.populate('tags').execPopulate()

            res.send(question.tags)
        } catch (error) {
            res.status(400).send()
        }
    },

    getQuestionAnswers: async (req, res) => {
        const _id = req.params.id
        try {
            const question = await Question.findById(_id)
            if (!question) return res.status(404).send()

            await question
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'owner_user_id',
                    },
                })
                .execPopulate()

            const answers = question.answers

            let id
            if (req.user) id = req.user._id

            for (let index = 0; index < answers.length; index++) {
                answers[index] = {
                    answer: answers[index],
                    my_vote: id ? await answers[index].getMyVote(id) : -1,
                }
            }

            res.send(question.answers)
        } catch (error) {
            res.status(400).send(error)
        }
    },
}

module.exports = QuestionController
