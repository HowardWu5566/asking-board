const router = require('express').Router()
const auth = require('./modules/auth')
const user = require('./modules/user')
const question = require('./modules/question')
const reply = require('./modules/reply')
const followship = require('./modules/followship')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const adminController = require('../controllers/admin-controller')
const { undefinedRoute } = require('../middleware/error-handler')
const { authenticated, authenticatedUser, authenticatedAdmin } = require('../middleware/auth')
const { signUpValidator, validate } = require('../middleware/validate')

router.post('/users', signUpValidator, validate, userController.signUp)
router.post('/users/login', userController.login)
router.post('/admin/login', adminController.login)

router.use('/auth', auth)
router.use('/users', authenticated, authenticatedUser, user)
router.use('/questions', authenticated, authenticatedUser, question)
router.use('/replies', authenticated, authenticatedUser, reply)
router.use('/followships', authenticated, authenticatedUser, followship)
router.use('/admin', authenticated, authenticatedAdmin, admin)

router.use('*', undefinedRoute)

module.exports = router
