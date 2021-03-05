const express = require('express')
const auth = require('../middleware/auth')
const Tag = require('../models/tag')

const router = new express.Router()

router.post('/tags', auth, async (req, res) => {
    const tag = new Tag(req.body)

    try {
        await tag.save()
        res.status(201).send({ tag })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tags/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const tag = await Tag.findOne({
            _id,
        })
        if (!tag) return res.status(404).send()
        res.send(tag)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/tags/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)

    try {
        const tag = await Tag.findOne({
            _id: req.params.id,
        })

        if (!tag) return res.status(404).send()

        updates.forEach((update) => (tag[update] = req.body[update]))

        await tag.save()

        res.send(tag)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tags/:id', auth, async (req, res) => {
    try {
        const tag = await Tag.findOneAndDelete({
            _id: req.params.id,
        })

        if (!tag) return res.status(404).send()

        res.send(tag)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tags/:id/questions', auth, async (req, res) => {
    try {
        const tag = await Tag.findOne({
            _id: req.params.id,
        })

        if (!tag) return res.status(404).send()

        await tag.populate('questions').execPopulate()

        res.send(tag.questions)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router
