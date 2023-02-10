const router = require('express').Router()
const userController = require('../../controllers/user-controller')

router.get('/:id', userController.getUser)
router.get('/:id/questions', userController.getUserQuestions)
router.get('/:id/replies', userController.getUserReplies)
router.get('/:id/followers', userController.getUserFollowers)

module.exports = router
