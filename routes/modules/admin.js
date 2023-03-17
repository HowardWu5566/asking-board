const router = require('express').Router()
const adminController = require('../../controllers/admin-controller')

router.get('/questions', adminController.getquestions)
router.get('/questions/:id', adminController.getquestion)
router.delete('/questions/:id', adminController.deleteQuestion)
router.get('/questions/:id/replies', adminController.getReplies)
router.delete('/replies/:id', adminController.deleteReply)
router.get('/users', adminController.getUsers)

module.exports = router
