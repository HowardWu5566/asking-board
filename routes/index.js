const router = require('express').Router()
const { undefinedRoute } = require('../middleware/error-handler')
const followship = require('./modules/followship')
const reply = require('./modules/reply')

router.use('/api/v1/replies', reply)
router.use('/api/v1/followships', followship)
router.get('/', (req, res) => {
  res.send('routes')
})
router.use('*', undefinedRoute)

module.exports = router
