const router = require('express').Router()
const adminController = require('../../controllers/admin-controller')

router.get('/questions', adminController.getquestions)
router.delete('/questions/:id', adminController.deleteQuestion)
router.delete('/replies/:id', adminController.deleteReply)
router.get('/users', adminController.getUsers)

module.exports = router
