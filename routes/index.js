const router = require('express').Router()
const question = require('./modules/question')
const reply = require('./modules/reply')
const followship = require('./modules/followship')
const userController = require('../controllers/user-controller')

const { authenticated, authenticatedUser } = require('../middleware/auth')
const { undefinedRoute } = require('../middleware/error-handler')

router.post('/api/v1/signup', userController.signUp)
router.post('/api/v1/users/login', userController.login)

router.use('/api/v1/questions', authenticated, authenticatedUser, question)
router.use('/api/v1/replies', authenticated, authenticatedUser, reply)
router.use('/api/v1/followships', authenticated, authenticatedUser, followship)

router.use('*', undefinedRoute)

module.exports = router
