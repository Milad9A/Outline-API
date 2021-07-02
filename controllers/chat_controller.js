const { RtcTokenBuilder, RtcRole } = require('agora-access-token')
const FCMHelper = require('../helpers/fcm_helper')
const User = require('../models/user_model')

const ChatController = {
    sendChatNotification: async (req, res) => {
        try {
            const otherUserEmail = req.body.other_user_email
            const otherUser = await User.findOne({ email: otherUserEmail })
            const otherUserFCMToken = otherUser.fcm_token
            const body = req.body.message_body

            const message = {
                notification: {
                    title: req.user.name,
                    body: body,
                },
                token: otherUserFCMToken,
                data: {
                    screen_name: 'conversation_screen',
                    other_user_email: otherUser.email,
                    other_user_name: otherUser.name,
                    other_user_avatar: otherUser.avatar,
                },
            }

            FCMHelper.sendPushNotification(message)

            res.send()
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    generateAccessToken: (req, res) => {
        res.header('Access-Control-Allow-Origin', '*')
        const channelName = req.query.channel_name
        if (!channelName) {
            return res.status(500).json({ error: 'channel is required' })
        }

        // get uid
        let uid = req.query.uid
        if (!uid || uid == '') {
            uid = 0
        }

        // get role
        let role = RtcRole.SUBSCRIBER
        if (req.query.role == 'publisher') {
            role = RtcRole.PUBLISHER
        }

        // get the expire time
        let expireTime = req.query.expireTime
        if (!expireTime || expireTime == '') {
            expireTime = 3600
        } else {
            expireTime = parseInt(expireTime, 10)
        }

        // calculate privilege expire time
        const currentTime = Math.floor(Date.now() / 1000)
        const privilegeExpireTime = currentTime + expireTime

        const token = RtcTokenBuilder.buildTokenWithUid(
            process.env.AGORA_APP_ID,
            process.env.AGORA_APP_CERTIFICATE,
            channelName,
            uid,
            role,
            privilegeExpireTime
        )

        res.on('finish', async () => {
            const otherUserEmail = req.query.other_user_email
            const otherUser = await User.findOne({ email: otherUserEmail })
            const otherUserFCMToken = otherUser.fcm_token

            const message = {
                notification: {
                    title: 'Outline',
                    body: `${req.user.name} is calling you!`,
                },
                token: otherUserFCMToken,
                data: {
                    screen_name: 'call_screen',
                    channel_name: channelName,
                    other_user_email: req.user.email,
                },
                android: {
                    ttl: 30000,
                },
            }

            FCMHelper.sendPushNotification(message)
        })

        res.json({ token: token })
        res.end()
    },
}

module.exports = ChatController
