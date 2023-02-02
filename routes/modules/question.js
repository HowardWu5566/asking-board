const router = require('express').Router()
const questionController = require('../../controllers/question-controller')

router.get('/', questionController.getQuestions)
router.post('/', questionController.postQuestion)
router.get('/:id', questionController.getQuestion)
router.get('/:id/replies',questionController.getReplies)

module.exports = router
