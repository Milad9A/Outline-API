const User = require('../models/user_model')
const Role = require('../models/role_model')

const UserController = {
    createBasicUser: async (req, res) => {
        const updates = Object.keys(req.body)

        const isValidOperation = !updates.includes('role')

        if (!isValidOperation)
            return res.status(400).send({ error: 'Unable to set role' })

        try {
            const user = new User(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    createAdminUser: async (req, res) => {
        const updates = Object.keys(req.body)

        const isValidOperation = !updates.includes('role')

        if (!isValidOperation)
            return res.status(400).send({ error: 'Unable to set role' })

        try {
            const user = new User({
                ...req.body,
                role: Role.ADMIN,
            })
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    createInstructorUser: async (req, res) => {
        const updates = Object.keys(req.body)

        const isValidOperation = !updates.includes('role')

        if (!isValidOperation)
            return res.status(400).send({ error: 'Unable to set role' })

        try {
            const user = new User({
                ...req.body,
                role: Role.INSTRUCTOR,
            })
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findByCredentials(
                req.body.email,
                req.body.password
            )
            if (!user)
                return res.status(401).send({
                    message: 'Invalid Email or Password',
                })

            const token = await user.generateAuthToken()

            await user.populate('tags').execPopulate()
            await user.populate('questions').execPopulate()
            await user.populate('questions.tags').execPopulate()
            await user.populate('articles').execPopulate()

            res.send({ user, token })
        } catch (error) {
            console.log(error)
            res.status(error.status).send({ message: error.message })
        }
    },

    logoutUser: async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    },

    logoutUserFromAll: async (req, res) => {
        try {
            req.user.tokens = []
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    },

    getUserMe: async (req, res) => {
        await req.user.populate('tags').execPopulate()
        await req.user.populate('questions').execPopulate()
        await req.user.populate('questions.tags').execPopulate()
        await req.user.populate('answers').execPopulate()
        await req.user.populate('articles').execPopulate()
        await req.user.populate('articles.tags').execPopulate()
        await req.user.populate('comments').execPopulate()
        await req.user.populate('courses').execPopulate()
        await req.user.populate('purchased_courses').execPopulate()

        res.send(req.user)
    },

    getAllUsersPublicInfo: async (req, res) => {
        try {
            const users = await User.find({}).select({
                email: 1,
                name: 1,
                avatar: 1,
            })

            res.send(users)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    updateUserMe: async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = [
            'name',
            'password',
            'aboutMe',
            'reputation',
            'accept_rate',
            'badge_counts',
            'tags',
        ]
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update)
        )

        if (!isValidOperation)
            return res.status(400).send({ error: 'Invalid Updates' })

        try {
            updates.forEach((update) => (req.user[update] = req.body[update]))
            await req.user.save()

            await req.user.populate('tags').execPopulate()

            res.send(req.user)
        } catch (error) {
            res.status(400).send(error)
        }
    },

    deleteUserMe: async (req, res) => {
        try {
            await req.user.remove()
            res.send(req.user)
        } catch (error) {
            res.status(500).send(error)
        }
    },

    deleteAvatarMe: async (req, res) => {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    },

    getAvatarMe: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
            if (!user || !user.avatar) {
                throw new Error()
            }
            res.set('Content-Type', 'image/png')
            res.send(user.avatar)
        } catch (error) {
            res.status(404).send()
        }
    },

    uploadAvatar: async (req, res) => {
        if (!req.file)
            return res.status(400).send({ error: 'No file was provided' })

        const cloudinary = require('cloudinary').v2
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET,
        })

        const path = req.file.path

        cloudinary.uploader.upload(path, async function (err, image) {
            if (err) return res.status(400).send(err)
            const fs = require('fs')
            fs.unlinkSync(path)
            req.user.avatar = image.secure_url
            await req.user.save()
            res.send({ avatar: req.user.avatar })
        })
    },
}

module.exports = UserController
