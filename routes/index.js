const express = require('express')
const router = express.Router()
const followship = require('./modules/followship')
const reply = require('./modules/reply')

router.use('/api/v1/replies', reply)
router.use('/api/v1/followships', followship)
router.get('/', (req, res) => {
  res.send('routes')
})

module.exports = router
