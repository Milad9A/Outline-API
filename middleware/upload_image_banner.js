const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/banners')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
})

const uploadImageBanner = multer({ storage: storage }).single('banner')

module.exports = uploadImageBanner
