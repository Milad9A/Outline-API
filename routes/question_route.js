const express = require('express')
const auth = require('../middleware/auth')
const QuestionController = require('../controllers/question_controller')

const router = new express.Router()

router.post('/questions', auth, QuestionController.createQuestion)

router.get('/questions', QuestionController.getAllQuestions)

router.get('/questions/me', auth, QuestionController.getMyQuestions)

router.get('/questions/:id', auth, QuestionController.getQuestion)

router.patch('/questions/:id', auth, QuestionController.updateQuestion)

router.delete('/questions/:id', auth, QuestionController.deleteQuestion)

router.get('/questions/:id/tags', auth, QuestionController.getQuestionTags)

module.exports = router
