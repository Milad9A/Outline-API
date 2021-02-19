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
app.use(require('./routes/user'))
app.use(require('./routes/question'))
app.use(require('./routes/answer'))
app.use(require('./routes/tag'))
app.use(require('./routes/privilege'))
app.use(require('./routes/badge'))

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
)
