const router = require('express').Router()
const adminController = require('../../controllers/admin-controller')

router.get('/questions', adminController.getQuestions)
router.get('/questions/:id', adminController.getQuestion)
router.delete('/questions/:id', adminController.deleteQuestion)
router.get('/questions/:id/replies', adminController.getReplies)
router.delete('/replies/:id', adminController.deleteReply)
router.get('/users', adminController.getUsers)

module.exports = router
