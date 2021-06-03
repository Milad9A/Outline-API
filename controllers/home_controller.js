const HomeController = {
    // TODO Use the articles and questions from the user's tags instead of the user's own articles and questions
    getNewsFeed: async (req, res) => {
        try {
            await req.user
                .populate({
                    path: 'articles',
                    options: {
                        limit: parseInt(req.query.limit),
                        skip: parseInt(req.query.skip),
                    },
                })
                .execPopulate()

            for (let index = 0; index < req.user.articles.length; index++) {
                await req.user.articles[index].populate('tags').execPopulate()
                await req.user.articles[index]
                    .populate('owner_user_id')
                    .execPopulate()
            }

            let articles = req.user.articles.map((article) => {
                return {
                    date: article.updatedAt,
                    type: 'article',
                    post: article,
                }
            })

            await req.user
                .populate({
                    path: 'questions',
                    options: {
                        limit: parseInt(req.query.limit),
                        skip: parseInt(req.query.skip),
                    },
                })
                .execPopulate()

            for (let index = 0; index < req.user.questions.length; index++) {
                await req.user.questions[index].populate('tags').execPopulate()
                await req.user.questions[index]
                    .populate('owner_user_id')
                    .execPopulate()
            }

            let questions = req.user.questions.map((question) => {
                return {
                    date: question.updatedAt,
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
