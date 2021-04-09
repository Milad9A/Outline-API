const Course = require('../models/course_model')
const Role = require('../models/role_model')
const User = require('../models/user_model')
const superagent = require('superagent')
const { getVideoDurationInSeconds } = require('get-video-duration')
const uploadVideoContent = require('../middleware/upload_video_content')
const credentials = require('../config/credentials.json')
const { google } = require('googleapis')
const streamifier = require('streamifier')
const CourseContent = require('../models/course_content_model')

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
                        course.banner = image.secure_url
                        await course.save()
                    }
                )
            }

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

        if (!course) {
            return res.status(401).send({
                error: 'Course not found.',
            })
        }

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

            for (let index = 0; index < courses.length; index++) {
                await courses[index].populate('contents').execPopulate()
                await courses[index].populate('owner_user_id').execPopulate()
            }

            res.send(courses)
        } catch (error) {
            console.error(error)
            res.status(400).send(error)
        }
    },

    getMyCourses: async (req, res) => {
        try {
            await req.user.populate('courses').execPopulate()

            const courses = req.user.courses

            for (let index = 0; index < courses.length; index++) {
                await courses[index].populate('contents').execPopulate()
                await courses[index].populate('owner_user_id').execPopulate()
            }

            res.send(courses)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    getPurchasedCourses: async (req, res) => {
        try {
            await req.user.populate('purchased_courses').execPopulate()

            const courses = req.user.purchased_courses

            for (let index = 0; index < courses.length; index++) {
                await courses[index].populate('contents').execPopulate()
                await courses[index].populate('owner_user_id').execPopulate()
            }

            res.send(courses)
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

    updateCourseContents: async (req, res) => {
        uploadVideoContent(req, res, async function (error) {
            if (error) {
                return res.status(400).send(error)
            }

            const course = await Course.findById(req.params.id)

            if (!course) return res.status(404).send()

            const user = await User.findById(req.user._id)
            const userRole = user.role

            if (userRole === Role.BASIC_USER)
                return res.status(400).send({
                    error:
                        'You must be an Instructor in order to create courses',
                })

            const scopes = ['https://www.googleapis.com/auth/drive']
            const auth = new google.auth.JWT(
                credentials.client_email,
                null,
                credentials.private_key,
                scopes
            )
            const drive = google.drive({ version: 'v3', auth })

            try {
                for (let index = 0; index < req.files.length; index++) {
                    const buffer = await req.files[index].buffer
                    const name = req.files[index].originalname
                    let durationInSeconds

                    getVideoDurationInSeconds(
                        streamifier.createReadStream(buffer)
                    ).then((duration) => {
                        durationInSeconds = duration
                    })

                    const mimetype = req.files[index].mimetype
                    const driveResponse = await drive.files.create({
                        requestBody: {
                            name: name,
                            mimeType: mimetype,
                            parents: ['1rX5J_XGIM45Ey65qJJGui1w6EeKgDPP2'],
                        },
                        media: {
                            mimeType: mimetype,
                            body: streamifier.createReadStream(buffer),
                        },
                    })
                    const newContent = new CourseContent({
                        content_name: driveResponse.data.name,
                        content_link:
                            'https://drive.google.com/file/d/' +
                            driveResponse.data.id +
                            '/view',
                        course_id: req.params.id,
                        video_duration_in_seconds: durationInSeconds,
                    })
                    await newContent.save()
                    course['contents'].push(newContent.id)
                    await course.save()
                }

                await course.populate('contents').execPopulate()

                res.status(200).send(course)
            } catch (error) {
                console.log(error)
                console.error(error)
                res.status(400).send(error)
            }
        })
    },
}

module.exports = CourseController
