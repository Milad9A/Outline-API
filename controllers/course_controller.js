const Course = require('../models/course_model')
const CourseContent = require('../models/course_content_model')
const Role = require('../models/role_model')
const User = require('../models/user_model')
const credentials = require('../config/credentials.json')
const { google } = require('googleapis')
const streamifier = require('streamifier')

const scopes = ['https://www.googleapis.com/auth/drive']
const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes
)
const drive = google.drive({ version: 'v3', auth })

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
            await course.save()
            res.status(201).send(course)
        } catch (error) {
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

    // // Create (Remove existing contents) contents for an existing Course
    createContentsForCourse: async (req, res) => {
        const course = await Course.findById(req.params.id)

        if (!course) return res.status(404).send()

        try {
            const newContents = req.body
            let newContentsIds = []

            newContents.forEach(async (content) => {
                try {
                    const newContent = new CourseContent({
                        ...content,
                        course_id: req.params.id,
                    })
                    newContentsIds.push(newContent._id)
                    await newContent.save()
                } catch (error) {
                    res.status(400).send(error)
                }
            })

            const oldContentsIds = course['contents']
            oldContentsIds.forEach(async (id) => {
                await CourseContent.findByIdAndRemove(id)
            })

            course['contents'] = newContentsIds

            await course.save()
            res.status(200).send(course)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    // Update (Add without removing) the contents of an existing Course
    UpdateContentsForCourse: async (req, res) => {
        const course = await Course.findById(req.params.id)

        if (!course) return res.status(404).send()

        try {
            const newContents = req.body
            let newContentsIds = []

            newContents.forEach(async (content) => {
                try {
                    const newContent = new CourseContent({
                        ...content,
                        course_id: req.params.id,
                    })
                    newContentsIds.push(newContent._id)
                    await newContent.save()
                } catch (error) {
                    res.status(400).send(error)
                }
            })

            newContentsIds.forEach((id) => {
                course['contents'].push(id)
            })

            await course.save()
            res.status(200).send(course)
        } catch (error) {
            res.status(400).send(error)
        }
    },
}

module.exports = CourseController
