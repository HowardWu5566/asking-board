const router = require('express').Router()
const questionController = require('../../controllers/question-controller')

router.get('/', questionController.getQuestions)
router.get('/:id', questionController.getQuestion)

module.exports = router
