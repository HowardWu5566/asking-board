const router = require('express').Router()
const { undefinedRoute } = require('../middleware/error-handler')

router.use('*', undefinedRoute)

module.exports = router
