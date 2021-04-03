const express = require('express')
const auth = require('../middleware/auth')
const CommentController = require('../controllers/comment_controller')

const router = new express.Router()

router.post('/comments', auth, CommentController.createComment)

router.get('/comments', CommentController.getAllComments)

router.get('/comments/me', auth, CommentController.getMyComments)

router.get('/comments/:id', auth, CommentController.getComment)

router.patch('/comments/:id', auth, CommentController.updateComment)

router.delete('/comments/:id', auth, CommentController.deleteComment)

module.exports = router
