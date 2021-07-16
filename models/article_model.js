const mongoose = require('mongoose')
const User = require('../models/user_model')

const articleSchema = new mongoose.Schema(
    {
        owner_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        content: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            unique: true,
        },
        view_count: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('View Count must be a positive number')
            },
        },
        banner: {
            type: String,
            default: 'https://wallpapercave.com/wp/wp2200994.png',
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tag',
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)

articleSchema.index({
    title: 'text',
    content: 'text',
})

articleSchema.statics = {
    searchPartial: function (q, callback) {
        return this.find(
            {
                $or: [
                    { title: new RegExp(q, 'gi') },
                    { body: new RegExp(q, 'gi') },
                ],
            },
            callback
        )
    },

    searchFull: function (q, callback) {
        return this.find(
            {
                $text: { $search: q, $caseSensitive: false },
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
    },
}

articleSchema.methods.getLikedByMe = async function (id) {
    try {
        const user = await User.findById(id)

        if (!user) throw new InvalidEmailOrPasswordError('User not found')

        if (this.likes.includes(id)) return 1
        return 0
    } catch (error) {
        console.log(error)
    }
}

const Article = mongoose.model('Article', articleSchema)

module.exports = Article
