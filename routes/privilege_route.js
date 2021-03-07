const express = require('express')
const auth = require('../middleware/auth')
const PrivilegeController = require('../controllers/privilege_controller')

const router = new express.Router()

router.post('/privileges', auth, PrivilegeController.createPrivilege)

router.get('/privileges', PrivilegeController.getAllPrivileges)

router.get('/privileges/:id', PrivilegeController.getPrivilege)

router.patch('/privileges/:id', PrivilegeController.updatePrivilege)

router.delete('/privileges/:id', PrivilegeController.deletePrivilege)

module.exports = router
