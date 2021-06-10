const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            validate(value) {
                if (value < 0)
                    throw new Error('Price must be a positive number')
            },
        },
        is_paid: {
            type: Boolean,
            default: true,
        },
        requirements: {
            type: String,
            required: true,
        },
        num_of_subscribers: {
            type: Number,
            default: 0,
        },
        num_of_lectures: {
            type: Number,
            default: 0,
        },
        avg_rating: {
            type: Number,
            default: 0,
        },
        banner: {
            type: String,
            default: 'https://wallpapercave.com/wp/wp2200994.png',
        },
        contents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CourseContent',
            },
        ],
    },
    {
        timestamps: true,
        typeKey: '$type',
    }
)

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
