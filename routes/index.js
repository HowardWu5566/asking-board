const express = require('express')
const router = express.Router()
const followship = require('./modules/followship')

router.use('/api/v1/followships', followship)
router.get('/', (req, res) => {
  res.send('routes')
})

module.exports = router
