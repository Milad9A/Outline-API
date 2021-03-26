const express = require('express')
const auth = require('../middleware/auth')
const multer = require('multer')

const CourseController = require('../controllers/course_controller')

const router = express.Router()

const upload = multer({
    limits: {
        fileSize: 10000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(mp4|mkv)$/)) {
            return cb(
                new Error('Please upload a valid video format (mp4 or mkv)')
            )
        }
        cb(undefined, true)
    },
})

router.post('/courses', auth, CourseController.createCourse)

router.get('/courses', auth, CourseController.getMyCourses)

router.get('/courses/:id', auth, CourseController.getCourse)

router.patch('/courses/:id', auth, CourseController.updateCourse)

router.delete('/courses/:id', auth, CourseController.deleteCourse)

router.get(
    '/courses/:id/categories',
    auth,
    CourseController.getCourseCategories
)

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

router.post(
    '/video-upload-test',
    upload.single('content'),
    CourseController.uploadVideo
)

module.exports = router
