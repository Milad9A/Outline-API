const express = require('express')
const auth = require('../middleware/auth')
const AnswerController = require('../controllers/answer_controller')

const router = new express.Router()

router.post('/answers', auth, AnswerController.createAnswer)

router.get('/answers', auth, AnswerController.getMyAnswers)

router.get('/answers/:id', auth, AnswerController.getAnswer)

router.patch('/answers/:id', auth, AnswerController.updateAnswer)

router.delete('/answers/:id', auth, AnswerController.deleteAnswer)

module.exports = router
