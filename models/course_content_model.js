const mongoose = require('mongoose')

const courseContentSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    content_name: {
        type: String,
        required: true,
    },
    content_link: {
        type: String,
        required: true,
    },
    content_type: {
        type: String,
        default: 'video',
    },
})

const CourseContent = mongoose.model('CourseContent', courseContentSchema)

module.exports = CourseContent
