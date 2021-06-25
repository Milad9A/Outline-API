const jwt = require('jsonwebtoken')
const User = require('../models/user_model')

const optionalAuth = async (req, res, next) => {
    try {
        if (req.header('Authorization')) {
            const token = req.header('Authorization').replace('Bearer ', '')
            const decoded = jwt.verify(token, 'thisisarandomstring')
            const user = await User.findOne({
                _id: decoded._id,
                'tokens.token': token,
            })

            if (user) {
                req.token = token
                req.user = user
            }
        }

        next()
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
}

module.exports = optionalAuth
