const Badge = require('../models/badge_model')

const BadgeController = {
    createBadge: async (req, res) => {
        const badge = new Badge({
            ...req.body,
        })

        try {
            await badge.save()
            res.status(201).send(badge)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getAllBadges: async (req, res) => {
        try {
            const badges = await Badge.find({})

            res.send(badges)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getBadge: async (req, res) => {
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
    },

    updateBadge: async (req, res) => {
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
    },

    deleteBadge: async (req, res) => {
        try {
            const badge = await Badge.findOneAndDelete({
                _id: req.params.id,
            })

            if (!badge) return res.status(404).send()

            res.send(badge)
        } catch (error) {
            res.status(500).send(error)
        }
    },
}

module.exports = BadgeController
