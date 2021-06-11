const Tag = require('../models/tag_model')

const TagController = {
    createTag: async (req, res) => {
        const tag = new Tag(req.body)

        try {
            await tag.save()
            res.status(201).send({ tag })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getAllTags: async (req, res) => {
        try {
            const tags = await Tag.find({})

            res.send(tags)
        } catch (error) {
            res.status(500).send()
        }
    },

    getTag: async (req, res) => {
        const _id = req.params.id

        try {
            const tag = await Tag.findOne({ _id })

            if (!tag) return res.status(404).send()
            res.send(tag)
        } catch (error) {
            res.status(500).send()
        }
    },

    updateTag: async (req, res) => {
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
    },

    deleteTag: async (req, res) => {
        try {
            const tag = await Tag.findOneAndDelete({
                _id: req.params.id,
            })

            if (!tag) return res.status(404).send()

            res.send(tag)
        } catch (error) {
            res.status(500).send(error)
        }
    },

    getTagQuestions: async (req, res) => {
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
    },
}

module.exports = TagController
