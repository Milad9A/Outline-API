const { RtcTokenBuilder, RtcRole } = require('agora-access-token')
const FCMHelper = require('../helpers/fcm_helper')
const User = require('../models/user_model')

const VideoCallController = {
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
            const otherUserEmail = req.body.other_user_email
            const otherUser = await User.findOne({ email: otherUserEmail })
            const otherUserFCMToken = otherUser.fcm_token

            console.log(otherUserFCMToken)

            const message = {
                notification: {
                    title: 'Outline',
                    body: `${req.user.name} is calling you!`,
                },
                token: otherUserFCMToken,
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

module.exports = VideoCallController
