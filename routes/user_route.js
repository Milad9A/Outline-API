const express = require('express')
const sharp = require('sharp')
const UserController = require('../controllers/user_controller')
const auth = require('../middleware/auth')
const uploadImageAvatar = require('../middleware/upload_image_avatar')

const router = new express.Router()

router.post('/users', UserController.createBasicUser)

router.post('/users-admin', UserController.createAdminUser)

router.post('/users-instructor', UserController.createInstructorUser)

router.post('/users/login', UserController.loginUser)

router.post('/users/logout', auth, UserController.logoutUser)

router.post('/users/logoutAll', auth, UserController.logoutUserFromAll)

router.get('/users/me', auth, UserController.getUserMe)

router.patch('/users/me', auth, UserController.updateUserMe)

router.delete('/users/me', auth, UserController.deleteUserMe)

router.delete('/users/me/avatar', auth, UserController.deleteAvatarMe)

router.get('/users/:id/avatar', UserController.getAvatarMe)

router.post(
    '/users/me/avatar',
    auth,
    uploadImageAvatar,
    UserController.uploadAvatar,
    (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    }
)

module.exports = router
