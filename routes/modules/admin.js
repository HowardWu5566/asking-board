const router = require('express').Router()
const adminController = require('../../controllers/admin-controller')

router.get('/questions', adminController.getquestions)
router.delete('/questions/:id', adminController.deleteQuestion)

module.exports = router
