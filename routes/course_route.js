const express = require('express')
const auth = require('../middleware/auth')
const uploadImageBanner = require('../middleware/upload_image_banner')
const CourseController = require('../controllers/course_controller')

const router = express.Router()

router.post(
    '/courses',
    auth,
    uploadImageBanner,
    CourseController.createCourse,
    (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    }
)

router.post('/courses/:id/purchase', auth, CourseController.purchaseCourse)

router.get('/courses', CourseController.getAllCourses)

router.get('/courses/me', auth, CourseController.getMyCourses)

router.get('/courses/purchased', auth, CourseController.getPurchasedCourses)

router.get('/courses/:id', auth, CourseController.getCourse)

router.patch('/courses/:id', auth, CourseController.updateCourse)

router.delete('/courses/:id', auth, CourseController.deleteCourse)

router.get(
    '/courses/:id/categories',
    auth,
    CourseController.getCourseCategories
)

router.patch(
    '/courses/:id/contents',
    auth,
    CourseController.updateCourseContents
)

module.exports = router
