const Article = require('../models/article_model')
const Tag = require('../models/tag_model')
const User = require('../models/user_model')
const FCMHelper = require('../helpers/fcm_helper')

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
            if (req.file) {
                const cloudinary = require('cloudinary').v2
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_SECRET,
                })

                const path = req.file.path

                await cloudinary.uploader.upload(
                    path,
                    async function (err, image) {
                        if (err) return res.status(400).send(err)
                        const fs = require('fs')
                        fs.unlinkSync(path)
                        article.banner = image.secure_url
                        await article.save()
                    }
                )
            }

            await req.user.articles.push(article)
            await req.user.save()
            await article.save()
            await article.populate('tags').execPopulate()
            await article.populate('owner_user_id').execPopulate()

            res.on('finish', async () => {
                if (article.tags.length > 0) {
                    const users = await User.find({})
                    for (let index = 0; index < users.length; index++) {
                        if (
                            users[index].tags.some((tag) =>
                                article.tags
                                    .map((articleTag) => articleTag._id)
                                    .includes(tag)
                            )
                        ) {
                            const tagId = users[index].tags[0].toString()
                            const message = {
                                notification: {
                                    title: 'Outline',
                                    body: `${req.user.name} posted a new article about that a tag you follow!`,
                                },
                                topic: tagId,
                            }

                            FCMHelper.sendPushNotification(message)
                            break
                        }
                    }
                }
            })

            res.status(201).send(article)
            res.end()
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getAllArticles: async (req, res) => {
        try {
            const articles = await Article.find({})

            for (let index = 0; index < articles.length; index++) {
                await articles[index].populate('tags').execPopulate()
                await articles[index].populate('owner_user_id').execPopulate()
            }

            res.send(articles)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getMyArticles: async (req, res) => {
        try {
            await req.user.populate('articles').execPopulate()

            let articles = req.user.articles

            for (let index = 0; index < articles.length; index++) {
                await articles[index].populate('tags').execPopulate()
                await articles[index].populate('owner_user_id').execPopulate()
            }

            res.send(articles)
        } catch (error) {
            console.log(error)
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

            await article.populate('tags').execPopulate()
            await article.populate('owner_user_id').execPopulate()

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

            await article.populate('tags').execPopulate()
            await article.populate('owner_user_id').execPopulate()

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

            const index = req.user.articles.indexOf(article)
            if (index > -1) req.user.articles.splice(index, 1)
            await req.user.save()

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
