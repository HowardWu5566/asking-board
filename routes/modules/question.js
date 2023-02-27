const router = require('express').Router()
const questionController = require('../../controllers/question-controller')
const upload = require('../../middleware/multer')

router.get('/', questionController.getQuestions)
router.post('/', upload.array('images', 5), questionController.postQuestion)
router.get('/:id', questionController.getQuestion)
router.put('/:id', questionController.putQuestion)
router.delete('/:id', questionController.deleteQuestion)
router.get('/:id/replies', questionController.getReplies)
router.post('/:id/replies', upload.array('images', 5), questionController.postReply)
router.post('/:id/like', questionController.postQuestionLike)
router.delete('/:id/like', questionController.deleteQuestionLike)

module.exports = router
