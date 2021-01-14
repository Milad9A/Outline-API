const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value))
                    throw new Error('Email is invalid')
            },
        },
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
        },
        aboutMe: {
            type: String,
            trim: true,
            default: "I'm a human :)",
        },
        avatar: {
            type: Buffer,
        },
        reputation: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Reputation must be a positive number')
            },
        },
        views: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Views must be a positive number')
            },
        },
        upVotes: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('UpVotes must be a positive number')
            },
        },
        downVotes: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('DownVotes must be a positive number')
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
)

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'owner_user_id',
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisisarandomstring')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw Error('Unable to login')

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)

    next()
})

// TODO: Delete user stuff when user is deleted

const User = mongoose.model('User', userSchema)

module.exports = User
