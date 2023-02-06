const router = require('express').Router()
const adminController = require('../../controllers/admin-controller')

router.get('/questions', adminController.getquestions)

module.exports = router
