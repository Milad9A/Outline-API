const dotenv = require('dotenv')
const express = require('express')
const morgan = require('morgan')
const connectDB = require('./config/db')

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

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
)
