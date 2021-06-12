const express = require('express')
const auth = require('../middleware/auth')
const noCache = require('../middleware/no_cache')

const VideoCallController = require('../controllers/video_call_controller')

const router = new express.Router()

router.get(
    '/agora-access-token',
    auth,
    noCache,
    VideoCallController.generateAccessToken
)

module.exports = router
