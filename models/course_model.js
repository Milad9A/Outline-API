const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            validate(value) {
                if (value < 0)
                    throw new Error('Price must be a positive number')
            }
        },
        is_paid: {
            type: Boolean,
            default: true
        },
        requirements: {
            type: String,
            required: true
        },
        length_of_the_course_in_seconds: {
            type: Number,
            default: 0
        },
        avg_rating: {
            type: Number,
            default: 0
        },
        banner: {
            type: String,
            default:
                'https://nkxdcq.bn.files.1drv.com/y4mpucnmk7D8wzBFFfnlFEmdU9UkZBpxlZ88okzdvlCdjd70LVTp1-W_0vLtAEIKOhgT685QcomB4mfLVgRxtwKUl6AIhXcA9OOKsRCMbowA9NQg85po3hrakr2fFV8hoZ_Visq3G6WZAbDQTzF9RpkJ_6uyS1Xhy83JwGnz3wSuKuplvs7OSzmutvC1W-xmcNjKSuFns8y8sMqOd09SkEr_ACBqUXFxvz3CyTOeRyEmXs/Course%20Cover.png'
        },
        subscribers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        contents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CourseContent'
            }
        ]
    },
    {
        timestamps: true
    }
)
courseSchema.index({
    title: 'text',
    description: 'text'
})

courseSchema.statics = {
    searchPartial: function (q, callback) {
        return this.find(
            {
                $or: [
                    { title: new RegExp(q, 'gi') },
                    { body: new RegExp(q, 'gi') }
                ]
            },
            callback
        )
    },

    searchFull: function (q, callback) {
        return this.find(
            {
                $text: { $search: q, $caseSensitive: false }
            },
            callback
        )
    },

    search: function (q, callback) {
        this.searchFull(q, (err, data) => {
            if (err) return callback(err, data)
            if (!err && data.length) return callback(err, data)
            if (!err && data.length === 0)
                return this.searchPartial(q, callback)
        })
    }
}

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
