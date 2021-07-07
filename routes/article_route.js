const express = require('express')
const auth = require('../middleware/auth')
const uploadImageBanner = require('../middleware/upload_image_banner')
const optionalAuth = require('../middleware/optional_auth')

const ArticleController = require('../controllers/article_controller')

const router = express.Router()

router.post(
    '/articles',
    auth,
    uploadImageBanner,
    ArticleController.createArticle,
    (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    }
)

router.get('/articles', optionalAuth, ArticleController.getAllArticles)

router.get('/articles/me', auth, ArticleController.getMyArticles)

router.get('/articles/:id', auth, ArticleController.getArticle)

router.post('/articles/:id/like', auth, ArticleController.likeArticle)

router.patch('/articles/:id', auth, ArticleController.updateArticle)

router.delete('/articles/:id', auth, ArticleController.deleteArticle)

router.get('/articles/:id/tags', auth, ArticleController.getArticleTags)

router.get('/articles/:id/comments', auth, ArticleController.getArticleComments)

module.exports = router
