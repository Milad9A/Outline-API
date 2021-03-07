const express = require('express')
const auth = require('../middleware/auth')
const CourseController = require('../controllers/course_controller')

const router = express.Router()

router.post('/courses', auth, CourseController.createCourse)

router.get('/courses', auth, CourseController.getMyCourses)

router.get('/courses/:id', auth, CourseController.getCourse)

router.patch('/courses/:id', auth, CourseController.updateCourse)

router.delete('/courses/:id', auth, CourseController.deleteCourse)

// TODO
// router.get('/courses/:id/categories', auth, async (req, res) => {})

// Create (Remove existing contents) contents for an existing Course
router.post(
    '/courses/:id/contents',
    auth,
    CourseController.createContentsForCourse
)

// Update (Add with removing) the contents of an existing Course
router.patch(
    '/courses/:id/contents',
    auth,
    CourseController.UpdateContentsForCourse
)

module.exports = router
