const router = require('express').Router()
const questionController = require('../../controllers/question-controller')
const upload = require('../../middleware/multer')
const {
  questionValidator,
  replyValidator,
  validate
} = require('../../middleware/validate')

router.get('/', questionController.getQuestions)
router.get('/popular', questionController.getPopularQuestions)
router.post(
  '/',
  upload.array('images', 5),
  questionValidator,
  validate,
  questionController.postQuestion
)
router.get('/:id', questionController.getQuestion)
router.put(
  '/:id',
  upload.array('images', 5),
  questionValidator,
  validate,
  questionController.putQuestion
)
router.delete('/:id', questionController.deleteQuestion)
router.get('/:id/replies', questionController.getReplies)
router.post(
  '/:id/replies',
  upload.array('images', 5),
  replyValidator,
  validate,
  questionController.postReply
)
router.post('/:id/like', questionController.postQuestionLike)
router.delete('/:id/like', questionController.deleteQuestionLike)

module.exports = router
