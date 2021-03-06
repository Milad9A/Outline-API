const express = require('express')
const auth = require('../middleware/auth')
const Course = require('../models/course')
const Role = require('../models/role')
const User = require('../models/user')

const router = express.Router()

router.post('/courses', auth, async (req, res) => {
    const user = await User.findById(req.user._id)
    const userRole = user.role

    if (userRole === Role.BASIC_USER)
        return res.status(400).send({
            error: 'You must be an Instructor in order to create courses',
        })

    const course = new Course({
        ...req.body,
        owner_user_id: req.user._id,
    })

    try {
        await course.save()
        res.status(201).send(course)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/courses', auth, async (req, res) => {
    try {
        await req.user.populate('courses').execPopulate()

        res.send(req.user.courses)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/courses/:id', auth, async (req, res) => {
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
})

router.patch('/courses/:id', auth, async (req, res) => {
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
})

router.delete('/courses/:id', auth, async (req, res) => {
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
})

// TODO
// router.get('/courses/:id/categories', auth, async (req, res) => {})

module.exports = router
