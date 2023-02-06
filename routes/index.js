const express = require('express')
const router = express.Router()
const adminController = require('../')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const admin = require('./modules/admin')

router.post('/api/v1/admin/login', adminController.login)

router.use('/api/v1/admin', authenticated, authenticatedAdmin, admin)

module.exports = router
