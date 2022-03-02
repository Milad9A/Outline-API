const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        let MONGO_URI

        if (process.env.NODE_ENV === 'development') {
            MONGO_URI = process.env.LOCAL_MONGO_URI
        } else {
            MONGO_URI = process.env.REMOTE_MONGO_URI
        }

        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

module.exports = connectDB
