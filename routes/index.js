const express = require('express')
const router = express.Router()
const adminController = require('../')

router.post('/api/v1/admin/login', adminController.login)
router.get('/', (req, res) => {
  res.send('routes')
})

module.exports = router
