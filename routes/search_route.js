const express = require('express')
const optionalAuth = require('../middleware/optional_auth')
const SearchController = require('../controllers/search_controller')

const router = new express.Router()

router.post('/search/articles', optionalAuth, SearchController.searchArticles)
router.post('/search/questions', optionalAuth, SearchController.searchQuestions)
router.post('/search/courses', optionalAuth, SearchController.searchCourses)

module.exports = router
