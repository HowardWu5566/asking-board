const router = require('express').Router()
const question = require('./modules/question')
const reply = require('./modules/reply')
const followship = require('./modules/followship')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const adminController = require('../controllers/admin-controller')
const { undefinedRoute } = require('../middleware/error-handler')
const {
  authenticated,
  authenticatedUser,
  authenticatedAdmin
} = require('../middleware/auth')

router.post('/api/v1/signup', userController.signUp)
router.post('/api/v1/users/login', userController.login)
router.post('/api/v1/admin/login', adminController.login)

router.use('/api/v1/questions', authenticated, authenticatedUser, question)
router.use('/api/v1/replies', authenticated, authenticatedUser, reply)
router.use('/api/v1/followships', authenticated, authenticatedUser, followship)
router.use('/api/v1/admin', authenticated, authenticatedAdmin, admin)

router.use('*', undefinedRoute)

module.exports = router
