const router = require('express').Router()
const question = require('./modules/question')
const reply = require('./modules/reply')
const followship = require('./modules/followship')
const { undefinedRoute } = require('../middleware/error-handler')

router.use('/api/v1/questions', question)
router.use('/api/v1/replies', reply)
router.use('/api/v1/followships', followship)

router.use('*', undefinedRoute)

module.exports = router
