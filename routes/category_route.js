const express = require('express')
const auth = require('../middleware/auth')
const CategoryController = require('../controllers/category_controller')

const router = new express.Router()

router.post('/categories', auth, CategoryController.createCategory)

router.get('/categories', CategoryController.getAllCategories)

router.get('/categories/:id', CategoryController.getCategory)

router.patch('/categories/:id', auth, CategoryController.updateCategory)

router.delete('/categories/:id', auth, CategoryController.deleteCategory)

router.get(
    '/categories/:id/courses',
    auth,
    CategoryController.getCategoryCourses
)

module.exports = router
