const express = require('express')
const auth = require('../middleware/auth')
const Badge = require('../models/badge')

const router = new express.Router()

router.post('/badges', auth, async (req, res) => {
    const badge = new Badge({
        ...req.body,
    })

    try {
        await badge.save()
        res.status(201).send(badge)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/badges', async (req, res) => {
    try {
        const badges = await Badge.find({})

        res.send(badges)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/badges/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const badge = await Badge.findOne({
            _id,
        })

        if (!badge) return res.status(404).send()

        res.send(badge)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/badges/:id', async (req, res) => {
    const updates = Object.keys(req.body)

    try {
        const badge = await Badge.findOne({
            _id: req.params.id,
        })

        if (!badge) return res.status(404).send()

        updates.forEach((update) => (badge[update] = req.body[update]))

        await badge.save()

        res.send(badge)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/badges/:id', async (req, res) => {
    try {
        const badge = await Badge.findOneAndDelete({
            _id: req.params.id,
        })

        if (!badge) return res.status(404).send()

        res.send(badge)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
