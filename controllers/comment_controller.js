const Comment = require('../models/comment_model')
const Article = require('../models/article_model')

const CommentController = {
    createComment: async (req, res) => {
        const comment = new Comment({
            ...req.body,
            owner_user_id: req.user._id,
        })

        try {
            const article = await Article.findById(req.body.article_id)
            if (!article) return res.status(404).send()

            await article.comments.push(comment)
            await article.save()

            await req.user.comments.push(comment)
            await req.user.save()

            await comment.save()
            await comment.populate('owner_user_id').execPopulate()

            res.status(201).send(comment)
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    getAllComments: async (req, res) => {
        try {
            const comments = await Comment.find({}, null, {
                populate: 'owner_user_id',
            }).exec()

            res.send(comments)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getMyComments: async (req, res) => {
        try {
            await req.user
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'owner_user_id',
                    },
                })
                .execPopulate()

            res.send(req.user.comments)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getComment: async (req, res) => {
        const _id = req.params.id

        try {
            const comment = await Comment.findOne({ _id })

            if (!comment) return res.status(404).send()

            await comment.populate('owner_user_id').execPopulate()

            res.send(comment)
        } catch (error) {
            res.status(500).send()
        }
    },

    updateComment: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const comment = await Comment.findOne({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!comment) return res.status(404).send()

            updates.forEach((update) => (comment[update] = req.body[update]))

            await comment.save()

            await comment.populate('owner_user_id').execPopulate()

            res.send(comment)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteComment: async (req, res) => {
        try {
            const comment = await Comment.findOneAndDelete({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!comment) return res.status(404).send()

            const index = req.user.comments.indexOf(comment)
            if (index > -1) req.user.comments.splice(index, 1)
            await req.user.save()

            res.send(comment)
        } catch (error) {
            res.status(500).send(error)
        }
    },
}

module.exports = CommentController
