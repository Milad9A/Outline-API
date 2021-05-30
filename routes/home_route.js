const express = require('express')
const auth = require('../middleware/auth')
const HomeController = require('../controllers/home_controller')

const router = express.Router()

router.get('/news-feed', auth, HomeController.getNewsFeed)

module.exports = router
