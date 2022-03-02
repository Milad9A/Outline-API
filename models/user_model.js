const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Role = require('./role_model')
const InvalidEmailOrPasswordError = require('../errors/invalid_email_or_password_error')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            default: Role.BASIC_USER
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
            }
        },
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true
        },
        fcm_token: {
            type: String,
            default: ''
        },
        aboutMe: {
            type: String,
            trim: true,
            default: "I'm a human :)"
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tag'
            }
        ],
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            }
        ],
        answers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Answer'
            }
        ],
        articles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Article'
            }
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        purchased_courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        avatar: {
            type: String,
            default:
                'https://nkxdcq.bn.files.1drv.com/y4m3SbwCOliC7q3kUMOdQB8SZIUKQnvXhytYte-xK8R-zjbKu9M9a41LVNBWUepL9vd4JHmr7dRkXxPjZ2sdayBweyFrhMlnU8wMrfd53hbWE9hCWqfYRcnMo0DBYBdibs14luZNAh1Oh8pd15Jaa6t9DKK6i4f3fVxaVKvsvJowMqGMfzvZvC-wMtptLF-WypAuJpjRXMLluNJT5DUbo9MSB8R1KRr5QnwNEPyiUZr7kg/Avatar.png'
        },
        reputation: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0)
                    throw new Error('Reputation must be a positive number')
            }
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.fcm_token

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
    if (!user)
        throw new InvalidEmailOrPasswordError('Invalid Email or Password')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
        throw new InvalidEmailOrPasswordError('Invalid Email or Password')

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
