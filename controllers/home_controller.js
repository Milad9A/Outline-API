const { populate } = require('../models/article_model')
const Article = require('../models/article_model')
const Question = require('../models/question_model')

const HomeController = {
    getNewsFeed: async (req, res) => {
        try {
            await req.user.populate('tags').execPopulate()

            const tags = req.user.tags

            let a = await Article.find({ tags: { $in: tags } }, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.articles_skip),
                sort: { createdAt: -1 },
            }).exec()

            let q = await Question.find({ tags: { $in: tags } }, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.questions_skip),
                sort: { createdAt: -1 },
            }).exec()

            for (let index = 0; index < a.length; index++) {
                await a[index].populate('tags').execPopulate()
                await a[index].populate('owner_user_id').execPopulate()
                a[index] = {
                    article: a[index],
                    my_like: await a[index].getLikedByMe(req.user._id),
                }
            }

            let articles = a.map((article) => {
                return {
                    date: article.article.createdAt,
                    type: 'article',
                    post: article,
                }
            })

            for (let index = 0; index < q.length; index++) {
                await q[index].populate('tags').execPopulate()
                await q[index]
                    .populate({
                        path: 'answers',
                        populate: {
                            path: 'owner_user_id',
                        },
                    })
                    .execPopulate()

                await q[index].populate('owner_user_id').execPopulate()
                q[index] = {
                    question: q[index],
                    my_vote: await q[index].getMyVote(req.user._id),
                }
            }

            let questions = q.map((question) => {
                return {
                    date: question.question.createdAt,
                    type: 'question',
                    post: question,
                }
            })

            let feed = articles.concat(questions)
            feed = feed.sort((a, b) => b.date - a.date)

            res.send(feed)
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },
}

module.exports = HomeController
