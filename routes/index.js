const express = require('express')
const router = express.Router()
const question = require('./modules/question')
const reply = require('./modules/reply')
const followship = require('./modules/followship')

router.use('/api/v1/questions', question)
router.use('/api/v1/replies', reply)
router.use('/api/v1/followships', followship)

router.get('/', (req, res) => {
  res.send('routes')
})

module.exports = router
