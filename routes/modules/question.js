const router = require('express').Router()
const questionController = require('../../controllers/question-controller')

router.get('/', questionController.getQuestions)

module.exports = router
