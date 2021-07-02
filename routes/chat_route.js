const express = require('express')
const auth = require('../middleware/auth')
const noCache = require('../middleware/no_cache')

const ChatController = require('../controllers/chat_controller')

const router = new express.Router()

router.get(
    '/agora-access-token',
    auth,
    noCache,
    ChatController.generateAccessToken
)

router.post(
    '/send-message-notification',
    auth,
    ChatController.sendChatNotification
)

module.exports = router
