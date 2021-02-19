const express = require('express')
const auth = require('../middleware/auth')
const Privilege = require('../models/privilege')

const router = new express.Router()

router.post('/privileges', auth, async (req, res) => {
    const privilege = new Privilege({
        ...req.body,
    })

    try {
        await privilege.save()
        res.status(201).send(privilege)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/privileges', async (req, res) => {
    try {
        const privileges = await Privilege.find({})

        res.send(privileges)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/privileges/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const privilege = await Privilege.findOne({
            _id,
        })

        if (!privilege) return res.status(404).send()

        res.send(privilege)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/privileges/:id', async (req, res) => {
    const updates = Object.keys(req.body)

    try {
        const privilege = await Privilege.findOne({
            _id: req.params.id,
        })

        if (!privilege) return res.status(404).send()

        updates.forEach((update) => (privilege[update] = req.body[update]))

        await privilege.save()

        res.send(privilege)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/privileges/:id', async (req, res) => {
    try {
        const privilege = await Privilege.findOneAndDelete({
            _id: req.params.id,
        })

        if (!privilege) return res.status(404).send()

        res.send(privilege)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
