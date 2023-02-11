const express = require('express')
const router = express.Router()
const reply = require('./modules/reply')

router.use('/api/v1/replies', reply)

router.get('/', (req, res) => {
  res.send('routes')
})

module.exports = router
