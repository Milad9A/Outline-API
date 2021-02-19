const express = require('express')
const auth = require('../middleware/auth')
const Question = require('../models/question')
const Tag = require('../models/tag')

const router = new express.Router()

router.post('/questions', auth, async (req, res) => {
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
        await question.save()
        res.status(201).send({ question })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/questions', auth, async (req, res) => {
    try {
        await req.user.populate('questions').execPopulate()

        res.send(req.user.questions)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/questions/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const question = await Question.findOne({
            _id,
            owner_user_id: req.user._id,
        })

        if (!question) return res.status(404).send()
        res.send(question)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/questions/:id', auth, async (req, res) => {
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

        res.send(question)
    } catch (error) {
        res.status(400).send({
            error: error,
        })
    }
})

router.delete('/questions/:id', auth, async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({
            _id: req.params.id,
            owner_user_id: req.user._id,
        })

        if (!question) return res.status(404).send()

        res.send(question)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/questions/:id/tags', auth, async (req, res) => {
    try {
        const question = await Question.findOne({
            _id: req.params.id,
        })

        if (!question) return res.status(404).send()

        await question.populate('tags').execPopulate()

        res.send(question.tags)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router
