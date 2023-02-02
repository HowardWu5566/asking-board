const express = require('express')
const router = express.Router()
const question = require('./modules/question')

router.use('/api/v1/questions', question)

router.get('/', (req, res) => {
  res.send('routes')
})

module.exports = router
