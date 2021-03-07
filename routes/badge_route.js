const express = require('express')
const auth = require('../middleware/auth')
const BadgeController = require('../controllers/badge_controller')

const router = new express.Router()

router.post('/badges', auth, BadgeController.createBadge)

router.get('/badges', BadgeController.getAllBadges)

router.get('/badges/:id', BadgeController.getBadge)

router.patch('/badges/:id', BadgeController.updateBadge)

router.delete('/badges/:id', BadgeController.deleteBadge)

module.exports = router
