const router = require('express').Router()
const questionController = require('../../controllers/question-controller')

router.get('/', questionController.getQuestions)
router.post('/', questionController.postQuestion)
router.get('/:id', questionController.getQuestion)
router.put('/:id', questionController.putQuestion)
router.delete('/:id', questionController.deleteQuestion)
router.get('/:id/replies', questionController.getReplies)
router.post('/:id/replies', questionController.postReply)
router.post('/:id/like', questionController.postQuestionLike)
router.delete('/:id/like', questionController.deleteQuestionLike)

module.exports = router
