const router = require('express').Router()
const questionController = require('../../controllers/question-controller')

router.get('/', questionController.getQuestions)
router.post('/', questionController.postQuestion)
router.get('/:id', questionController.getQuestion)

module.exports = router
