const dotenv = require('dotenv')
const express = require('express')
const morgan = require('morgan')
const connectDB = require('./config/db')
const bodyParser = require('body-parser')

// Load config
dotenv.config({
    path: './config/config.env',
})

connectDB()

const app = express()

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Use JSON
app.use(express.json())

// Enable Access-Control-Origin
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
    res.header('Access-Control-Allow-Headers', '*')
    next()
})

// Able to GET images inside upload folder
app.use('/uploads', express.static('./uploads'))

// Routes
app.use(require('./routes/user_route'))
app.use(require('./routes/question_route'))
app.use(require('./routes/answer_route'))
app.use(require('./routes/tag_route'))
app.use(require('./routes/privilege_route'))
app.use(require('./routes/badge_route'))
app.use(require('./routes/article_route'))
app.use(require('./routes/comment_route'))
app.use(require('./routes/course_route'))
app.use(require('./routes/category_route'))
app.use(require('./routes/home_route'))

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
)
