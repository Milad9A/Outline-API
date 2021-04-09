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
    video_duration_in_seconds: {
        type: String,
        default: '0',
    },
})

const CourseContent = mongoose.model('CourseContent', courseContentSchema)

module.exports = CourseContent
