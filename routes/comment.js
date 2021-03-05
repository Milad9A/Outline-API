const express = require('express')
const auth = require('../middleware/auth')
const Comment = require('../models/comment')

const router = new express.Router()

router.post('/comments', auth, async (req, res) => {
    const comment = new Comment({
        ...req.body,
        owner_user_id: req.user._id,
    })

    try {
        await comment.save()
        res.status(201).send(comment)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/comments', auth, async (req, res) => {
    try {
        await req.user.populate('comments').execPopulate()

        res.send(req.user.comments)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/comments/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const comment = await Comment.findOne({
            _id,
            owner_user_id: req.user._id,
        })

        if (!comment) return res.status(404).send()

        res.send(comment)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/comments/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)

    try {
        const comment = await Comment.findOne({
            _id: req.params.id,
            owner_user_id: req.user._id,
        })

        if (!comment) return res.status(404).send()

        updates.forEach((update) => (comment[update] = req.body[update]))

        await comment.save()

        res.send(comment)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/comments/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.id,
            owner_user_id: req.user._id,
        })

        if (!comment) return res.status(404).send()

        res.send(comment)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
