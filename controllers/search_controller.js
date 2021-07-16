const Article = require('../models/article_model')
const Course = require('../models/course_model')
const Question = require('../models/question_model')

const SearchController = {
    searchArticles: async (req, res) => {
        try {
            const query = req.query.query

            Article.search(query, async function (err, articles) {
                if (err) res.status(400).send(err)

                let id
                if (req.user) id = req.user._id

                for (let index = 0; index < articles.length; index++) {
                    await articles[index].populate('tags').execPopulate()
                    await articles[index]
                        .populate('owner_user_id')
                        .execPopulate()
                    articles[index] = {
                        article: articles[index],
                        my_like: id
                            ? await articles[index].getLikedByMe(id)
                            : 0,
                    }
                }

                res.send(articles)
            })
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    searchQuestions: async (req, res) => {
        try {
            const query = req.query.query

            Question.search(query, async function (err, questions) {
                if (err) res.status(400).send(err)

                let id
                if (req.user) id = req.user._id

                for (let index = 0; index < questions.length; index++) {
                    await questions[index].populate('tags').execPopulate()
                    await questions[index]
                        .populate('owner_user_id')
                        .execPopulate()
                    questions[index] = {
                        question: questions[index],
                        my_vote: id ? await questions[index].getMyVote(id) : -1,
                    }
                }

                res.send(questions)
            })
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    searchCourses: async (req, res) => {
        try {
            const query = req.query.query

            Course.search(query, async function (err, courses) {
                if (err) res.status(400).send(err)

                for (let index = 0; index < courses.length; index++) {
                    await courses[index].populate('contents').execPopulate()
                    await courses[index]
                        .populate('owner_user_id')
                        .execPopulate()
                }

                res.send(courses)
            })
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },
}

module.exports = SearchController
