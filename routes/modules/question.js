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
router.post('/', upload.single('image'), questionValidator, validate, questionController.postQuestion)
router.get('/:id', questionController.getQuestion)
router.put('/:id', upload.single('image'), questionValidator, validate, questionController.putQuestion)
router.delete('/:id', questionController.deleteQuestion)
router.get('/:id/replies', questionController.getReplies)
router.post('/:id/replies', upload.single('image'), replyValidator, validate, questionController.postReply)
router.post('/:id/like', questionController.postQuestionLike)
router.delete('/:id/like', questionController.deleteQuestionLike)

module.exports = router
