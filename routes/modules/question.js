const router = require('express').Router()
const questionController = require('../../controllers/question-controller')
const upload = require('../../middleware/multer')
const {
  questionValidator,
  questionValidate,
  replyValidator,
  replyValidate
} = require('../../middleware/validate')

router.get('/', questionController.getQuestions)
router.post(
  '/',
  upload.array('images', 5),
  questionValidator,
  questionValidate,
  questionController.postQuestion
)
router.get('/:id', questionController.getQuestion)
router.put('/:id', questionController.putQuestion)
router.delete('/:id', questionController.deleteQuestion)
router.get('/:id/replies', questionController.getReplies)
router.post(
  '/:id/replies',
  upload.array('images', 5),
  replyValidator,
  replyValidate,
  questionController.postReply
)
router.post('/:id/like', questionController.postQuestionLike)
router.delete('/:id/like', questionController.deleteQuestionLike)

module.exports = router
