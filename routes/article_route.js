const express = require('express')
const ArticleController = require('../controllers/article_controller')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/articles', auth, ArticleController.createArticle)

router.get('/articles', ArticleController.getAllArticles)

router.get('/articles/me', auth, ArticleController.getMyArticles)

router.get('/articles/:id', auth, ArticleController.getArticle)

router.patch('/articles/:id', auth, ArticleController.updateArticle)

router.delete('/articles/:id', auth, ArticleController.deleteArticle)

router.get('/articles/:id/tags', auth, ArticleController.getArticleTags)

module.exports = router
