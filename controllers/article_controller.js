const Article = require('../models/article_model')
const Tag = require('../models/tag_model')

const ArticleController = {
    createArticle: async (req, res) => {
        const article = new Article({
            ...req.body,
            owner_user_id: req.user._id,
        })

        let tags = []
        article.tags.forEach((tag) => {
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
            tag.articles.push(article)
            await tag.save()
        })

        try {
            await article.save()
            res.status(201).send(article)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getMyArticles: async (req, res) => {
        try {
            await req.user.populate('articles').execPopulate()

            res.send(req.user.articles)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getArticle: async (req, res) => {
        const _id = req.params.id

        try {
            const article = await Article.findOne({
                _id,
                owner_user_id: req.user._id,
            })

            if (!article) return res.status(404).send()
            res.send(article)
        } catch (error) {
            res.status(500).send()
        }
    },

    updateArticle: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const article = await Article.findOne({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!article) return res.status(404).send()

            updates.forEach((update) => (article[update] = req.body[update]))

            let tags = []

            article.tags.forEach((tag) => {
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
                tag.articles.push(article)
                await tag.save()
            })

            await article.save()

            res.send(article)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteArticle: async (req, res) => {
        try {
            const article = await Article.findOneAndDelete({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!article) return res.status(404).send()

            res.send(article)
        } catch (error) {
            res.status(500).send()
        }
    },

    getArticleTags: async (req, res) => {
        try {
            const article = await Article.findOne({
                _id: req.params.id,
            })

            if (!article) return res.status(404).send()

            await article.populate('tags').execPopulate()

            res.send(article.tags)
        } catch (error) {
            res.status(500).send()
        }
    },
}

module.exports = ArticleController
