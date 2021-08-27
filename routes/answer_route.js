const express = require('express')
const auth = require('../middleware/auth')
const AnswerController = require('../controllers/answer_controller')

const router = new express.Router()

router.post('/answers', auth, AnswerController.createAnswer)

router.get('/answers', AnswerController.getAllAnswers)

router.get('/answers/me', auth, AnswerController.getMyAnswers)

router.get('/answers/:id', auth, AnswerController.getAnswer)

router.post('/answers/:id/vote/', auth, AnswerController.voteAnswer)

router.patch('/answers/:id', auth, AnswerController.updateAnswer)

router.delete('/answers/:id', auth, AnswerController.deleteAnswer)

module.exports = router
