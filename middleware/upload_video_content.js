const multer = require('multer')

const uploadVideoContent = multer({
    limits: {
        fileSize: 10000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(mp4|mkv)$/)) {
            return cb(
                new Error('Please upload a valid video format (mp4 or mkv)')
            )
        }
        cb(undefined, true)
    },
}).array('content')

module.exports = uploadVideoContent
