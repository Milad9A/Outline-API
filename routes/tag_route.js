const express = require('express')
const auth = require('../middleware/auth')
const TagController = require('../controllers/tag_controller')

const router = new express.Router()

router.post('/tags', auth, TagController.createTag)

router.get('/tags', TagController.getAllTags)

router.get('/tags/:id', TagController.getTag)

router.patch('/tags/:id', auth, TagController.updateTag)

router.delete('/tags/:id', auth, TagController.deleteTag)

router.get('/tags/:id/questions', auth, TagController.getTagQuestions)

module.exports = router
