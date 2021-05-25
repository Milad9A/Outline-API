const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/avatars')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    },
})

const uploadImageAvatar = multer({ storage: storage }).single('avatar')

module.exports = uploadImageAvatar
