const Course = require('../models/course_model')
const Role = require('../models/role_model')
const User = require('../models/user_model')
const superagent = require('superagent')

const CourseController = {
    createCourse: async (req, res) => {
        const user = await User.findById(req.user._id)
        const userRole = user.role

        if (userRole === Role.BASIC_USER)
            return res.status(400).send({
                error: 'You must be an Instructor in order to create courses',
            })

        const course = new Course({
            ...req.body,
            owner_user_id: req.user._id,
            contents: [],
        })

        try {
            await req.user.courses.push(course)
            await req.user.save()
            await course.save()
            res.status(201).send(course)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    purchaseCourse: async (req, res) => {
        const user = req.user
        const course = await Course.findById(req.params.id)

        if (user.purchased_courses.includes(course._id)) {
            return res.status(400).send({
                error: 'You have already purchased this course',
            })
        }

        superagent
            .post('https://banker-app-api.herokuapp.com/payments')
            .send({
                url: 'https://outline-app-api.herokuapp.com/courses',
                amount: course.price,
                name: 'course purchase',
            })
            .set('Authorization', req.body.authorization)
            .set('accept', 'json')
            .end(async (err, result) => {
                if (result.ok) {
                    user.purchased_courses.push(course)
                    await user.save()
                    res.status(201).send()
                } else if (result.status == 402) {
                    res.status(402).send({
                        error:
                            'Insufficient funds. Unable to complete the payment process.',
                    })
                } else {
                    res.status(result.status).send(err)
                }
            })
    },

    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find({})

            res.send(courses)
        } catch (error) {
            console.error(error)
            res.status(400).send(error)
        }
    },

    getMyCourses: async (req, res) => {
        try {
            await req.user.populate('courses').execPopulate()

            res.send(req.user.courses)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getCourse: async (req, res) => {
        const _id = req.params.id

        try {
            const course = await Course.findOne({
                _id,
                owner_user_id: req.user._id,
            })

            if (!course) return res.status(404).send()
            await course.populate('contents').execPopulate()
            res.send(course)
        } catch (error) {
            res.status(500).send()
        }
    },

    updateCourse: async (req, res) => {
        const updates = Object.keys(req.body)

        try {
            const course = await Course.findOne({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!course) return res.status(404).send()

            updates.forEach((update) => (course[update] = req.body[update]))

            await course.save()

            res.send(course)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteCourse: async (req, res) => {
        try {
            const course = await Course.findOneAndDelete({
                _id: req.params.id,
                owner_user_id: req.user._id,
            })

            if (!course) return res.status(404).send()

            res.send(course)
        } catch (error) {
            res.status(500).send()
        }
    },

    getCourseCategories: async (req, res) => {
        try {
            const course = await Course.findOne({
                _id: req.params.id,
            })

            if (!course) return res.status(404).send()

            await course.populate('categories').execPopulate()

            res.send(course.categories)
        } catch (error) {
            res.status(500).send()
        }
    },
}

module.exports = CourseController
