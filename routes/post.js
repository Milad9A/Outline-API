const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const Post = require('../models/post')
const User = require('../models/user')

const router = new express.Router()

router.post('/posts', auth, async (req, res) => {
    const post = new Post({
        ...req.body,
        owner_user_id: req.user._id,
    })

    try {
        await post.save()
        res.status(201).send({ post })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/posts', auth, async (req, res) => {
    try {
        await req.user.populate('posts').execPopulate()

        res.send(req.user.posts)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/posts/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const post = await Post.findOne({
            _id,
            owner_user_id: req.user._id,
        })
        if (!post) return res.status(404).send()
        res.send(post)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/posts/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        'last_editor_user_id',
        'accepted_answer_id',
        'body',
        'title',
        'score',
        'view_count',
        'last_editor_display_name',
        'answer_count',
        'comment_count',
        'favorite_count',
    ]
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    )

    if (!isValidOperation)
        return res.status(400).send({
            error: 'Invalid Updates!',
        })

    try {
        const post = await Post.findOne({
            _id: req.params.id,
            owner_user_id: req.user._id,
        })

        if (!post) return res.status(404).send()

        updates.forEach((update) => (post[update] = req.body[update]))
        await post.save()

        res.send(post)
    } catch (error) {
        res.status(400).send()
    }
})

router.delete('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            owner_user_id: req.user._id,
        })
        if (!post) return res.status(404).send()
        res.send(post)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router
