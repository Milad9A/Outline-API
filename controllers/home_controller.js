const HomeController = {
    getNewsFeed: async (req, res) => {
        try {
            await req.user.populate('tags').execPopulate()

            const tags = req.user.tags

            let a = []
            let q = []

            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i]
                await tag.populate('articles').execPopulate()
                await tag.populate('questions').execPopulate()

                for (let j = 0; j < tag.articles.length; j++) {
                    const article = tag.articles[j]
                    const exists = a.some((el) => el._id === article._id)
                    if (!exists) a.push(article)
                }

                for (let j = 0; j < tag.questions.length; j++) {
                    const question = tag.questions[j]
                    const exists = q.some((el) => el._id === question._id)
                    if (!exists) q.push(question)
                }
            }

            for (let index = 0; index < a.length; index++) {
                await a[index].populate('tags').execPopulate()
                await a[index].populate('owner_user_id').execPopulate()
            }

            let articles = a.map((article) => {
                return {
                    date: article.updatedAt,
                    type: 'article',
                    post: article,
                }
            })

            for (let index = 0; index < q.length; index++) {
                await q[index].populate('tags').execPopulate()
                await q[index].populate('owner_user_id').execPopulate()
            }

            let questions = q.map((question) => {
                return {
                    date: question.updatedAt,
                    type: 'question',
                    post: question,
                }
            })

            let feed = articles.concat(questions)
            feed = feed.sort((a, b) => b.date - a.date)

            const skip = parseInt(req.query.skip)
            const limit = parseInt(req.query.limit)

            res.send(feed.slice(skip, skip + limit))
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },
}

module.exports = HomeController
